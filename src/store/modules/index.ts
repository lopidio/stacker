const modules: any = {};
if (process.env.NODE_ENV !== 'test') {
    const requireModule = require.context('.', false, /\.store\.ts$/);
    const moduleNames: string[] = [];
    requireModule.keys()
        .forEach(filename => {

            // create the module name from fileName
            // remove the store.js extension and capitalize
            const moduleName: string = filename
                .replace(/(\.\/|\.store\.ts)/g, '');

            modules[moduleName] = requireModule(filename).default || requireModule(filename);
            moduleNames.push(moduleName);
        });

    console.log('Store modules: ' + moduleNames.join('; '));
}
export default modules;