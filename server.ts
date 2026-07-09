/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from "dotenv";
import { startServer } from "./server/app";

dotenv.config();

startServer();
