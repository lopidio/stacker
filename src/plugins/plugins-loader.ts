import * as fs from 'fs';
import * as os from 'os';
import store from "@/store";
import * as path from "path";
import {remote} from "electron";
import Store from 'electron-store';
import {exec} from 'child_process';
import requireFromString from 'require-from-string';
import * as httpPublisher from '@/plugins/http-publisher';
import * as httpSubscription from '@/plugins/http-subscription';
import {EnqueuerLogParser} from "@/components/enqueuer-log-parser";

const pluginsRepository = new Store({name: 'plugins'});

//TODO test it
export class PluginsLoader {
    private readonly plugins: any;
    private readonly pluginsString: string[];

    constructor() {
        this.plugins = {
            publishers: {http: httpPublisher.default.publishers.http},
            subscriptions: {http: httpSubscription.default.subscriptions.http}
        };
        this.pluginsString = pluginsRepository.get('pluginsString', []);
        this.pluginsString
            .forEach((pluginString: string) => this.loadStringPlugin(pluginString));
    }

    public getPlugins(): object {
        return this.plugins;
    }

    public loadPlugins(): object {
        const pickedFiles = remote.dialog.showOpenDialogSync({properties: ['openFile', 'openDirectory', 'multiSelections']});
        ((pickedFiles) || []).forEach(file => this.loadFromFileSystem(file));
        remote.getGlobal('eventEmitter').emit('resetEnqueuer');
        return this.plugins;
    }

    private loadFromFileSystem(file: string): void {
        const stats = fs.statSync(file);
        if (stats.isDirectory()) {
            this.loadDirectory(file);
        }
        this.loadFileFromFileSystem(file);
    }

    private loadDirectory(dirname: string): void {
        fs.readdirSync(dirname)
            .forEach(file => this.loadFileFromFileSystem(path.join(dirname, file)));
    }

    private loadFileFromFileSystem(filename: string): void {
        try {
            const fileContent = fs.readFileSync(filename).toString();
            const plugin = this.loadStringPlugin(fileContent);
            this.installEnqueuerPlugins(plugin);
            this.pluginsString.push(fileContent);
            pluginsRepository.set('pluginsString', this.pluginsString);
        } catch (e) {
            console.log(e);
        }
    }

    private loadStringPlugin(pluginString: string): any {
        try {
            const plugin = requireFromString(pluginString);
            this.addPlugin(plugin);
            return plugin;
        } catch (e) {
            console.log(e);
        }
    }

    private installEnqueuerPlugins(plugin: any): void {
        const enqueuerDependencies = PluginsLoader.getEnqueuerDependencies(plugin);
        enqueuerDependencies
            .filter(enqueuerPlugin => enqueuerPlugin)
            .forEach(enqueuerPlugin => {
                store.commit('stage/addInstallingPluginModal');
                store.commit('stage/addLog', EnqueuerLogParser
                    .generateLog(`Installing '${enqueuerPlugin}'`, 'INFO'));
                exec(`npm install --prefix ${os.homedir()}/.nqr ${enqueuerPlugin}`, ((error, stdout) => {
                    store.commit('stage/addLog', EnqueuerLogParser
                        .generateLog(`'${enqueuerPlugin}' installation: ${stdout}`, 'INFO'));
                    store.commit('stage/removeInstallingPluginModal');
                }));
            });
    }

    private addPlugin(plugin: any) {
        this.plugins.publishers = {
            ...this.plugins.publishers,
            ...plugin.publishers
        };
        this.plugins.subscriptions = {
            ...this.plugins.subscriptions,
            ...plugin.subscriptions
        };
    }

    private static getEnqueuerDependencies(plugin: any) {
        const publisherPlugins = Object
            .keys(plugin.publishers || {})
            .map(key => plugin.publishers[key].enqueuerPlugin);
        const subscriptionPlugins = Object
            .keys(plugin.subscriptions || {})
            .map(key => plugin.publishers[key].enqueuerPlugin);
        return publisherPlugins
            .concat(subscriptionPlugins)
            .filter(name => name);
    }
}
