<template>
    <b-row class="pb-1 carabina-text p-2 plugin-manager-item" :style="itemStyle" no-gutters>
        <b-col col class="px-2" style="font-weight: bold; color: var(--carabina-text-color);">
            {{item.name}}
        </b-col>
        <b-col cols="auto" class="align-self-center px-2">
            <i :style="{visibility: (isInstalled) ? 'visible': 'hidden'}"
               class="fas fa-check carabina-icon"></i>
        </b-col>
        <b-col cols="auto" class="px-2">
            <small>
                {{item.version}}
            </small>
        </b-col>
        <span class="pl-3 pt-3">
            {{item.description}}
        </span>
    </b-row>
</template>
<script>
    import Vue from 'vue';
    import '@/styles/texts.css';
    import {mapGetters} from 'vuex';

    export default Vue.extend({
        name: 'PluginManagerItem',
        props: {
            item: Object,
            selected: Boolean
        },
        computed: {
            ...mapGetters('stage', ['pluginsNames']),
            //TODO move this to store
            isInstalled: function () {
                return this.pluginsNames.some(name => name.startsWith(`${this.item.name}/`));
            },
            itemStyle: function () {
                const style = {
                    height: '70px',
                    cursor: 'pointer',
                    overflow: 'hidden'
                };
                if (this.selected) {
                    style.color = 'var(--carabina-text-color)';
                    style['background-color'] = 'var(--carabina-header-background-color)';
                }
                return style;
            }
        }
    });
</script>
<style type="text/css">

    .plugin-manager-item {
        border-bottom: 1px solid var(--carabina-header-background-lighter-color);
    }

    .plugin-manager-item:hover {
        color: var(--carabina-text-color);
    }

</style>
