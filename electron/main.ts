import { ElectronEgg } from 'ee-core';
import { Lifecycle } from './preload/lifecycle';
import { preload } from './preload';
import os from 'os';

// ee-core 的 logger/ps 依赖这些环境变量；在任何 logger 首次使用前确保存在
process.env.EE_USER_HOME ||= process.env.HOME || os.homedir();
process.env.EE_APP_NAME ||= process.env.npm_package_name || 'electron-cicd';

// New app
const app = new ElectronEgg();

// Register lifecycle
const life = new Lifecycle();
app.register("ready", life.ready);
app.register("electron-app-ready", life.electronAppReady);
app.register("window-ready", life.windowReady);
app.register("before-close", life.beforeClose);

// Register preload
app.register("preload", preload);

// Run
app.run();