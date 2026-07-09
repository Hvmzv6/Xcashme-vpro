import net from "net";

export interface ThermalReceiptItem {
    product?: {
        name?: string;
        retailPrice?: number;
    };
    quantity: number;
}

export interface ThermalReceipt {
    invoiceNumber?: string;
    timestamp?: string;
    items?: ThermalReceiptItem[];
    total?: number;
}

export interface ThermalPrintOptions {
    receipt: ThermalReceipt;
    printerType?: string;
    printerAddress?: string;
    paperSize?: string;
}

export function buildThermalReceiptBuffer(receipt: ThermalReceipt, paperSize = "80mm") {
    const ESC = 0x1B;
    const GS = 0x1D;
    const LF = 0x0A;

    const buffer: number[] = [
        ESC, 0x40,
        ESC, 0x61, 0x01,
        ESC, 0x45, 0x01,
    ];

    const appendText = (value: string) => {
        for (let i = 0; i < value.length; i++) {
            buffer.push(value.charCodeAt(i));
        }
    };

    const lineBreak = "--------------------------------\r\n";
    appendText(`Xcashme-vpro POS (${paperSize})\r\n`);
    buffer.push(ESC, 0x45, 0x00);
    appendText(lineBreak);
    buffer.push(ESC, 0x61, 0x00);
    appendText(`Invoice: #${receipt.invoiceNumber || "INV-000"}\r\n`);
    appendText(`Date: ${receipt.timestamp || new Date().toLocaleString()}\r\n`);
    appendText(lineBreak);

    if (receipt.items && Array.isArray(receipt.items)) {
        receipt.items.forEach((item) => {
            const itemLine = `${item.product?.name || "Item"} x${item.quantity}  ${(item.product?.retailPrice || 0) * item.quantity} SAR\r\n`;
            appendText(itemLine);
        });
    }

    appendText(lineBreak);
    buffer.push(ESC, 0x45, 0x01);
    appendText(`TOTAL: ${receipt.total || 0} SAR\r\n`);
    buffer.push(ESC, 0x45, 0x00);
    buffer.push(LF, LF, LF);
    buffer.push(GS, 0x56, 0x41, 0x03);

    return Buffer.from(buffer);
}

export async function printThermalReceipt(options: ThermalPrintOptions) {
    const {
        receipt,
        printerType = "simulated",
        printerAddress = "192.168.1.100:9100",
        paperSize = "80mm"
    } = options;

    const finalBuffer = buildThermalReceiptBuffer(receipt, paperSize);

    if (printerType === "network") {
        const [host, portStr] = printerAddress.split(":");
        const port = parseInt(portStr || "9100", 10);

        return new Promise<{ status: string; mode: string; bytesSent?: number; target?: string; message?: string }>((resolve) => {
            const client = new net.Socket();
            client.setTimeout(4500);

            client.connect(port, host, () => {
                client.write(finalBuffer, () => {
                    client.destroy();
                    resolve({ status: "success", mode: "network", bytesSent: finalBuffer.length, target: `${host}:${port}` });
                });
            });

            client.on("timeout", () => {
                client.destroy();
                resolve({ status: "error", mode: "network", message: `Timeout connecting to printer at ${host}:${port}` });
            });

            client.on("error", (err) => {
                client.destroy();
                resolve({ status: "error", mode: "network", message: err.message });
            });
        });
    }

    console.log(`[ESC/POS Thermal Print Simulated] Size: ${paperSize}, Bytes formatted: ${finalBuffer.length}`);
    return { status: "success", mode: "simulated", bytesFormatted: finalBuffer.length };
}
