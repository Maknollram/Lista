Vue.component('input-autocomplete', {
	template: `
	<div :class="checkGroupClass">
		<div v-if="label && label.length > 0" :class="labelclass">{{ label }}</div>
		<input
		:required="required"
		v-on:input="updateValue"
		autocomplete="off"
		:placeholder="placeholder"
		type="text"
		:maxlength="maxlength"
		:list="hash"
		:name="name"
		:id="id"
		:pattern="pattern"
		:class="checkClass"
		v-model="item"
		v-on:blur="$emit('blur', true)"
		v-on:click="$emit('click')"
		/>
		<datalist :id="hash">
			<option v-for="c in list" :data-value="c[id]" :value="c[desc]" />
		</datalist>
	</div>
	`,
	props: [
	'placeholder',
	'required',
	'name',
	'id',
	'classname',
	'value',
	'maxlength',
	'list',
	'id',
	'desc',
	'errorclass',
	'pattern',
	'label',
	'labelclass',
	'groupclass',
	'grouperror'
	],
	data() {
		return {
			item: this.value,
			itemId: '',
			error: false,
			hash: Math.random().toString(36).substr(2)+Math.random().toString(36).substr(2)
		}
	},
	methods: {
		updateValue() {
			let value = ''
			let selected = this.list.filter(item => item[this.desc] == this.item )
			if (selected.length === 1) {
				value = selected[0][this.id]
			}
			this.itemId = value
			this.error = (this.itemId === '')
			this.$emit('error', this.error)
			this.$emit('input', value)
			this.$emit('value', value)
			this.$emit('text', this.item)
		},
		reset() {
			this.item = ""
			this.itemId = ""
			this.error = false
		},
		selectDesc(desc) {
			const filtered = this.list.filter(item => item[this.desc] == desc)
			if (filtered.length != 1) {
				console.log("selectDesc() error, zero or more than one item was found!")
				return
			}
			this.item = desc
			this.updateValue()
		},
		selectId(id) {
			const filtered = this.list.filter(item => item[this.id] == id)
			if (filtered.length != 1) {
				console.log("selectId() error, zero or more than one item was found!")
				return
			}
			this.item = filtered[0][this.desc]
			this.updateValue()
		},
		setText(text) {
			this.item = text
		}
	},
	computed: {
		checkClass() {
			return (this.error) ? `${this.classname} ${this.errorclass}` : this.classname
		},
		checkGroupClass() {
			return (this.error) ? `${this.groupclass} ${this.grouperror}` : this.groupclass
		}
	}
})