'use strict'

const {strictEqual} = require('assert')

const {tokenize, clean} = require('@popovmp/tokenizer')
const {describe, it}    = require('@popovmp/mocha-tiny')

const {parse, DataType, NodeType} = require('../index.js')

/**
 * Parses source code to Nodes
 * @param {string} src
 *
 * @return {Node[]}
 */
function parseModule(src)
{
	const tokens     = tokenize(src)
	const cleaned    = clean(tokens)
	const moduleNode = parse(cleaned)

	return moduleNode.nodes
}

describe('function return', () => {
	it('return number', () => {
		const src = `
			float foo() {
				return 3.14;
			}`
		const [funcNode]    = parseModule(src)
		const [_, funcBody] = funcNode.nodes
		const [returnNode]  = funcBody.nodes
		const [numberNode]  = returnNode.nodes

		strictEqual(typeof funcNode,   'object',           'funcNode must be an object')
		strictEqual(funcNode.type,     NodeType.function,  'funcNode.type must be NodeType.function')
		strictEqual(funcNode.value,    'foo',              'funcNode.value must be "foo"')
		strictEqual(funcNode.dataType, DataType.f32,       'funcNode.dataType must be f32')

		strictEqual(typeof returnNode,    'object',        'returnNode must be an object')
		strictEqual(returnNode.type,      NodeType.return, 'returnNode.type must be NodeType.return')
		strictEqual(returnNode.value,     'foo',           'returnNode.value must be "foo"')
		strictEqual(returnNode.dataType,  DataType.f32,    'returnNode.dataType must be f32')

		strictEqual(typeof numberNode,    'object',        'numberNode must be an object')
		strictEqual(numberNode.type,      NodeType.number, 'numberNode.type must be NodeType.number')
		strictEqual(numberNode.value,     3.14,            'numberNode.value must be 3.14')
		strictEqual(numberNode.dataType,  DataType.f32,    'numberNode.dataType must be f32')
	})

	it('return global var', () => {
		const src = `
			int bar = 42;
			int foo() {
				return bar;
			}`
		const [globalVar, funcNode]    = parseModule(src)
		const [_, funcBody] = funcNode.nodes
		const [returnNode]  = funcBody.nodes
		const [valueNode]   = returnNode.nodes

		strictEqual(typeof globalVar,   'object',           'globalVar must be an object')
		strictEqual(globalVar.type,     NodeType.globalVar, 'globalVar.type must be NodeType.globalVar')
		strictEqual(globalVar.value,    'bar',              'globalVar.value must be "bar"')
		strictEqual(globalVar.dataType, DataType.i32,       'globalVar.dataType must be i32')

		strictEqual(typeof funcNode,   'object',           'funcNode must be an object')
		strictEqual(funcNode.type,     NodeType.function,  'funcNode.type must be NodeType.function')
		strictEqual(funcNode.value,    'foo',              'funcNode.value must be "foo"')
		strictEqual(funcNode.dataType, DataType.i32,       'funcNode.dataType must be i32')

		strictEqual(typeof returnNode,    'object',        'returnNode must be an object')
		strictEqual(returnNode.type,      NodeType.return, 'returnNode.type must be NodeType.return')
		strictEqual(returnNode.value,     'foo',           'returnNode.value must be "foo"')
		strictEqual(returnNode.dataType,  DataType.i32,    'returnNode.dataType must be i32')

		strictEqual(typeof valueNode,    'object',           'valueNode must be an object')
		strictEqual(valueNode.type,      NodeType.globalGet, 'valueNode.type must be NodeType.globalGet')
		strictEqual(valueNode.value,     'bar',              'valueNode.value must be "bar')
		strictEqual(valueNode.dataType,  DataType.i32,       'valueNode.dataType must be i32')
	})

	it('return global const', () => {
		const src = `
			const int bar = 42;
			int foo() {
				return bar;
			}`
		const [_const,  funcNode] = parseModule(src)
		const [_params, funcBody] = funcNode.nodes
		const [returnNode] = funcBody.nodes
		const [valueNode]  = returnNode.nodes

		strictEqual(typeof valueNode,    'object',           'valueNode must be an object')
		strictEqual(valueNode.type,      NodeType.globalGet, 'valueNode.type must be NodeType.globalGet')
		strictEqual(valueNode.value,     'bar',              'valueNode.value must be "bar')
		strictEqual(valueNode.dataType,  DataType.i32,       'valueNode.dataType must be i32')
	})

	it('return function parameter', () => {
		const src = `
			int foo(int bar) {
				return bar;
			}`
		const [funcNode]    = parseModule(src)
		const [_params, funcBody] = funcNode.nodes
		const [returnNode]  = funcBody.nodes
		const [valueNode]   = returnNode.nodes

		strictEqual(typeof valueNode,    'object',          'valueNode must be an object')
		strictEqual(valueNode.type,      NodeType.localGet, 'valueNode.type must be NodeType.localGet')
		strictEqual(valueNode.value,     'bar',             'valueNode.value must be "bar')
		strictEqual(valueNode.dataType,  DataType.i32,      'valueNode.dataType must be i32')
	})

	it('return local variable', () => {
		const src = `
			int foo() {
				int bar;
				return bar;
			}`
		const [funcNode] = parseModule(src)
		const [_params, funcBody] = funcNode.nodes
		const [_localVar, returnNode]  = funcBody.nodes
		const [valueNode]   = returnNode.nodes

		strictEqual(typeof valueNode,    'object',          'valueNode must be an object')
		strictEqual(valueNode.type,      NodeType.localGet, 'valueNode.type must be NodeType.localGet')
		strictEqual(valueNode.value,     'bar',             'valueNode.value must be "bar')
		strictEqual(valueNode.dataType,  DataType.i32,      'valueNode.dataType must be i32')
	})
})
