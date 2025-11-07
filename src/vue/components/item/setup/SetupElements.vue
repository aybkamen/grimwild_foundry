<template>
    <fieldset class="setup-elements-fieldset add-another-entries">
        <legend>{{ context.systemFields.elements.label }}</legend>
        <button class="legend-control entry-create"
                title="Add element"
                data-action="createArrayEntry"
                data-field="elements">
            <i class="fas fa-plus"></i>
        </button>
        <div class="elements entries form-group stacked">
            <div class="element entry form-group stacked" v-for="(el, key) in context.system.elements" :key="key">
                <div class="flexrow">
                    <select :name="`system.elements.${key}.state`" v-model="context.system.elements[key].state" class="element-state">
                        <option value=""> </option>
                        <option value="yes">yes</option>
                        <option value="no">no</option>
                    </select>
                    <input type="text"
                           :name="`system.elements.${key}.label`"
                           v-model="context.system.elements[key].label"
                           placeholder="Element label"/>
                    <a class="entry-delete"
                       title="Delete element"
                       data-action="deleteArrayEntry"
                       data-field="elements"
                       :data-key="key"><i class="fas fa-trash"></i></a>
                </div>
            </div>
        </div>
    </fieldset>
</template>

<script setup>
const props = defineProps(["context"]);
</script>

