import * as fs from "fs";
import * as yaml from "yamljs";
import {remote} from "electron";
import {IdCreator} from "@/components/id-creator";
import store from "@/store";

//TODO test it
export class EnvironmentLoader {

    public load(): any {
        return (remote.dialog.showOpenDialogSync({properties: ['openFile', 'multiSelections']}) || [])
            .map((file: string) => EnvironmentLoader.loadFile(file))
            .filter((file: any) => file);
    }

    public static importPostmanEnvironment(): void {
        (remote.dialog.showOpenDialogSync({properties: ['openFile', 'multiSelections']}) || [])
            .map((file: string) => EnvironmentLoader.loadPostmanEnvironment(file))
            .forEach(environment => store.commit('nav-bar/addEnvironment', environment));
    }

    private static loadFile(file: string): any {
        try {
            const fileContent = fs.readFileSync(file).toString();
            try {
                return EnvironmentLoader.loadEnvironment(JSON.parse(fileContent));
            } catch (e) {
                try {
                    return EnvironmentLoader.loadEnvironment(yaml.parse(fileContent));
                } catch (e) {
                    console.log(e);
                }
            }
        } catch (e) {
            console.log(e);
        }
        return null;
    }

    private static loadEnvironment(raw: any): any {
        const defaultEnvironment: any = {
            name: 'New Environment',
            id: new IdCreator().create(),
            store: {}
        };
        Object.keys(defaultEnvironment)
            .filter(key => raw[key] !== undefined)
            .forEach(key => {
                defaultEnvironment[key] = raw[key];
            });

        return defaultEnvironment;
    }

    private static loadPostmanEnvironment(file: string) {
        try {
            const raw = JSON.parse(fs.readFileSync(file).toString());
            raw.store = (raw.values || []).reduce((acc: any, value: any) => {
                if (value.enabled) {
                    acc[value.key] = value.value
                }
                return acc;
            }, {});
            return EnvironmentLoader.loadEnvironment(raw);
        } catch (e) {
            console.log(e);
        }
        return null;
    }
}
