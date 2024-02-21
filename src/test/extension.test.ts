import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { parse } from '../extension';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
	test('logana file format parser', () => {
		const testData = "/src/main.rs:13:1|unexpected closing delimiter: `}`\n" +
			"/src/other.rs:13:1|unexpected closing delimiter: `}`";

		assert.strictEqual(parse(testData), []);
	});
});
