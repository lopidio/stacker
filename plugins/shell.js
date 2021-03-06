const plugin = {
    name: 'shell',
    version: '0.0.1',
    publishers: {
        exec: {
            urlHelp: 'https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback',
            dependencies: ['enqueuer-plugin-shell'],
            hooks: ['onCommandExecuted'],
            template: `
                <b-container fluid class="p-0 m-0">
                    <label class="pl-3 d-block carabina-text mb-0">Options</label>
                    <key-value-table
                            @change="onOptionsChange"
                            :table="options" class="mb-4"></key-value-table>
                    <label class="pl-3 d-block carabina-text mb-2">Command</label>
                    <payload :code="command"
                             @change="onCommandChange"
                             class="px-3"></payload>
                </b-container>
            `,
            props: {
                component: {
                    options: Object,
                    command: String,
                }
            },
            data: function () {
                const content = this.getContent();
                return {
                    ...content
                }
            },
            mounted: function() {
                this.$parent.updateAttribute('options', this.options);
                this.$parent.updateAttribute('command', this.command);
            },
            methods: {
                getContent: function () {
                    return {
                        options: (this.component && this.component.options) || {'timeout': 10000, maxBuffer: 1024, killSignal: 31},
                        command: (this.component && this.component.command) || 'echo "stacker"',
                    }
                },
                onOptionsChange: function (value) {
                    this.options = value;
                    this.$parent.updateAttribute('options', value);
                },
                onCommandChange: function (value) {
                    this.command = value;
                    this.$parent.updateAttribute('command', value);
                }
            }
        }
    }
};

module.exports = plugin;
