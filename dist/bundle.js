/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/logger-nodejs/src/index.js":
/*!*************************************************!*\
  !*** ./node_modules/logger-nodejs/src/index.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {/* eslint no-console: 0 */



const DEFAULT_OPTS = { logMetadata: true, plugins: [] };
const LOG_LEVELS = {
    'debug': 0,
    'info': 1,
    'warn': 2,
    'error': 3,
    'fatal': 4,
    'always': 5
};

/**
 * Creates a logger that exposes various logging functions based on the selected log level.
 * The selected log level acts as a filter with regards to how much you want printed out.
 * If you choose 'info' as your log level then everything from info - fatal will be printed out.
 * On the other hand if you want to only print out the most severe errors you could select 'error'
 * as the log level which would cause only error and fatal logs to be printed out. There is a function
 * available for every log level from the level chosen all the way to the highest level. For example,
 * if you were to choose `fatal` as your selected log level then an instance of this class would have
 * a `fatal()` function available for you to use.
 */
class Logger {
    constructor(opts = {}) {
        opts = { ...DEFAULT_OPTS, ...opts };
        const logLevel = process.env['LOG_LEVEL'] || 'info';

        // store the numerical value of the selected log level so we don't have to look it up every time we log
        // something
        this.SELECTED_LEVEL = LOG_LEVELS[logLevel.toLowerCase()];
        this.name = opts.name;
        this.plugins = opts.plugins;
        this.output = console.log;


        // Create a function for each log level that is greater than or equal to the selected log level.
        // For example, if the selected log level is `info` then we create the following functions:
        //   info, warn, error fatal.
        Object.keys(LOG_LEVELS).forEach(logLevel => { this[logLevel] = this.log(logLevel); });
    }

    log(level) {
        return async function(text, opts = {}) {
            const levelValue = LOG_LEVELS[level];

            if (levelValue < this.SELECTED_LEVEL) return;

            let timestamp = `<${new Date().toLocaleString()}>`;
            text = `[${level.toUpperCase()}] ${timestamp} (${this.name}) -> ${text}`;

            // serialize and log metadata if metadata logging is turned on.
            if (this.logMetadata && opts.metadata) {
                text += ` ${JSON.stringify(opts.metadata)}`;
            }

            this.output(text);

            // run all attached plugins
            for (let plugin of this.plugins) {
                try {
                    plugin.run({ text, level, levelValue, opts });
                } catch (e) {
                    this.output('plugin error:', e);

                }
            }
        };
    }

    set name(name) {
        if (name) {
            this._name = `${name}-${process.pid}`;
        } else {
            this._name = process.pid;
        }
    }

    get name() {
        return this._name;
    }

    static getLevelValue(level) {
        return LOG_LEVELS[level];
    }
}

// Export logger
module.exports = Logger;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../process/browser.js */ "./node_modules/process/browser.js")))

/***/ }),

/***/ "./node_modules/process/browser.js":
/*!*****************************************!*\
  !*** ./node_modules/process/browser.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/BSTree.js":
/*!****************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/BSTree.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BSTreeKV_1 = __webpack_require__(/*! ./BSTreeKV */ "./node_modules/typescript-collections/dist/lib/BSTreeKV.js");
/**
 * Special-case of the binary search tree in which the search key is equal to the element type.
 * This definition is suitable when the element type can not be split between what defines its order
 * and what does not (eg. primitive types as opposed to indexed records).
 *
 * The table below shows some use-case examples for both interfaces:
 *
 *           element type              |  most suitable interface
 * ------------------------------------|----------------------------
 *    number                           |  BSTree<number>
 *    string                           |  BSTree<string>
 * { order: number, data: string }     |  BSTreeKV<{order: number}, {order: number, data: string}>
 *
 * @see BSTreeKV
 */
var BSTree = /** @class */ (function (_super) {
    __extends(BSTree, _super);
    function BSTree() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BSTree;
}(BSTreeKV_1.default));
exports.default = BSTree;
//# sourceMappingURL=BSTree.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/BSTreeKV.js":
/*!******************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/BSTreeKV.js ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var util = __webpack_require__(/*! ./util */ "./node_modules/typescript-collections/dist/lib/util.js");
var Queue_1 = __webpack_require__(/*! ./Queue */ "./node_modules/typescript-collections/dist/lib/Queue.js");
/**
 * General binary search tree implementation.
 *
 * This interface allows one to search elements using a subset of their attributes (thus the
 * tree can be used as an index for complex objects).
 * The attributes required to define an ordering in the tree must be defined in the type K.
 * Any additional attribute must be defined in the type V.
 *
 * @see BSTree
 */
var BSTreeKV = /** @class */ (function () {
    /**
     * Creates an empty binary search tree.
     * @class <p>A binary search tree is a binary tree in which each
     * internal node stores an element such that the elements stored in the
     * left subtree are less than it and the elements
     * stored in the right subtree are greater.</p>
     * <p>Formally, a binary search tree is a node-based binary tree data structure which
     * has the following properties:</p>
     * <ul>
     * <li>The left subtree of a node contains only nodes with elements less
     * than the node's element</li>
     * <li>The right subtree of a node contains only nodes with elements greater
     * than the node's element</li>
     * <li>Both the left and right subtrees must also be binary search trees.</li>
     * </ul>
     * <p>If the inserted elements are custom objects a compare function must
     * be provided at construction time, otherwise the <=, === and >= operators are
     * used to compare elements. Example:</p>
     * <pre>
     * function compare(a, b) {
     *  if (a is less than b by some ordering criterion) {
     *     return -1;
     *  } if (a is greater than b by the ordering criterion) {
     *     return 1;
     *  }
     *  // a must be equal to b
     *  return 0;
     * }
     * </pre>
     * @constructor
     * @param {function(Object,Object):number=} compareFunction optional
     * function used to compare two elements. Must return a negative integer,
     * zero, or a positive integer as the first argument is less than, equal to,
     * or greater than the second.
     */
    function BSTreeKV(compareFunction) {
        this.root = null;
        this.compare = compareFunction || util.defaultCompare;
        this.nElements = 0;
    }
    /**
     * Adds the specified element to this tree if it is not already present.
     * @param {Object} element the element to insert.
     * @return {boolean} true if this tree did not already contain the specified element.
     */
    BSTreeKV.prototype.add = function (element) {
        if (util.isUndefined(element)) {
            return false;
        }
        if (this.insertNode(this.createNode(element)) !== null) {
            this.nElements++;
            return true;
        }
        return false;
    };
    /**
     * Removes all of the elements from this tree.
     */
    BSTreeKV.prototype.clear = function () {
        this.root = null;
        this.nElements = 0;
    };
    /**
     * Returns true if this tree contains no elements.
     * @return {boolean} true if this tree contains no elements.
     */
    BSTreeKV.prototype.isEmpty = function () {
        return this.nElements === 0;
    };
    /**
     * Returns the number of elements in this tree.
     * @return {number} the number of elements in this tree.
     */
    BSTreeKV.prototype.size = function () {
        return this.nElements;
    };
    /**
     * Returns true if this tree contains the specified element.
     * @param {Object} element element to search for.
     * @return {boolean} true if this tree contains the specified element,
     * false otherwise.
     */
    BSTreeKV.prototype.contains = function (element) {
        if (util.isUndefined(element)) {
            return false;
        }
        return this.searchNode(this.root, element) !== null;
    };
    /**
     * Looks for the value with the provided search key.
     * @param {Object} element The key to look for
     * @return {Object} The value found or undefined if it was not found.
     */
    BSTreeKV.prototype.search = function (element) {
        var ret = this.searchNode(this.root, element);
        if (ret === null) {
            return undefined;
        }
        return ret.element;
    };
    /**
     * Removes the specified element from this tree if it is present.
     * @return {boolean} true if this tree contained the specified element.
     */
    BSTreeKV.prototype.remove = function (element) {
        var node = this.searchNode(this.root, element);
        if (node === null) {
            return false;
        }
        this.removeNode(node);
        this.nElements--;
        return true;
    };
    /**
     * Executes the provided function once for each element present in this tree in
     * in-order.
     * @param {function(Object):*} callback function to execute, it is invoked with one
     * argument: the element value, to break the iteration you can optionally return false.
     */
    BSTreeKV.prototype.inorderTraversal = function (callback) {
        this.inorderTraversalAux(this.root, callback, {
            stop: false
        });
    };
    /**
     * Executes the provided function once for each element present in this tree in pre-order.
     * @param {function(Object):*} callback function to execute, it is invoked with one
     * argument: the element value, to break the iteration you can optionally return false.
     */
    BSTreeKV.prototype.preorderTraversal = function (callback) {
        this.preorderTraversalAux(this.root, callback, {
            stop: false
        });
    };
    /**
     * Executes the provided function once for each element present in this tree in post-order.
     * @param {function(Object):*} callback function to execute, it is invoked with one
     * argument: the element value, to break the iteration you can optionally return false.
     */
    BSTreeKV.prototype.postorderTraversal = function (callback) {
        this.postorderTraversalAux(this.root, callback, {
            stop: false
        });
    };
    /**
     * Executes the provided function once for each element present in this tree in
     * level-order.
     * @param {function(Object):*} callback function to execute, it is invoked with one
     * argument: the element value, to break the iteration you can optionally return false.
     */
    BSTreeKV.prototype.levelTraversal = function (callback) {
        this.levelTraversalAux(this.root, callback);
    };
    /**
     * Returns the minimum element of this tree.
     * @return {*} the minimum element of this tree or undefined if this tree is
     * is empty.
     */
    BSTreeKV.prototype.minimum = function () {
        if (this.isEmpty() || this.root === null) {
            return undefined;
        }
        return this.minimumAux(this.root).element;
    };
    /**
     * Returns the maximum element of this tree.
     * @return {*} the maximum element of this tree or undefined if this tree is
     * is empty.
     */
    BSTreeKV.prototype.maximum = function () {
        if (this.isEmpty() || this.root === null) {
            return undefined;
        }
        return this.maximumAux(this.root).element;
    };
    /**
     * Executes the provided function once for each element present in this tree in inorder.
     * Equivalent to inorderTraversal.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    BSTreeKV.prototype.forEach = function (callback) {
        this.inorderTraversal(callback);
    };
    /**
     * Returns an array containing all of the elements in this tree in in-order.
     * @return {Array} an array containing all of the elements in this tree in in-order.
     */
    BSTreeKV.prototype.toArray = function () {
        var array = [];
        this.inorderTraversal(function (element) {
            array.push(element);
            return true;
        });
        return array;
    };
    /**
     * Returns the height of this tree.
     * @return {number} the height of this tree or -1 if is empty.
     */
    BSTreeKV.prototype.height = function () {
        return this.heightAux(this.root);
    };
    /**
     * @private
     */
    BSTreeKV.prototype.searchNode = function (node, element) {
        var cmp = 1;
        while (node !== null && cmp !== 0) {
            cmp = this.compare(element, node.element);
            if (cmp < 0) {
                node = node.leftCh;
            }
            else if (cmp > 0) {
                node = node.rightCh;
            }
        }
        return node;
    };
    /**
     * @private
     */
    BSTreeKV.prototype.transplant = function (n1, n2) {
        if (n1.parent === null) {
            this.root = n2;
        }
        else if (n1 === n1.parent.leftCh) {
            n1.parent.leftCh = n2;
        }
        else {
            n1.parent.rightCh = n2;
        }
        if (n2 !== null) {
            n2.parent = n1.parent;
        }
    };
    /**
     * @private
     */
    BSTreeKV.prototype.removeNode = function (node) {
        if (node.leftCh === null) {
            this.transplant(node, node.rightCh);
        }
        else if (node.rightCh === null) {
            this.transplant(node, node.leftCh);
        }
        else {
            var y = this.minimumAux(node.rightCh);
            if (y.parent !== node) {
                this.transplant(y, y.rightCh);
                y.rightCh = node.rightCh;
                y.rightCh.parent = y;
            }
            this.transplant(node, y);
            y.leftCh = node.leftCh;
            y.leftCh.parent = y;
        }
    };
    /**
     * @private
     */
    BSTreeKV.prototype.inorderTraversalAux = function (node, callback, signal) {
        if (node === null || signal.stop) {
            return;
        }
        this.inorderTraversalAux(node.leftCh, callback, signal);
        if (signal.stop) {
            return;
        }
        signal.stop = callback(node.element) === false;
        if (signal.stop) {
            return;
        }
        this.inorderTraversalAux(node.rightCh, callback, signal);
    };
    /**
     * @private
     */
    BSTreeKV.prototype.levelTraversalAux = function (node, callback) {
        var queue = new Queue_1.default();
        if (node !== null) {
            queue.enqueue(node);
        }
        node = queue.dequeue() || null;
        while (node != null) {
            if (callback(node.element) === false) {
                return;
            }
            if (node.leftCh !== null) {
                queue.enqueue(node.leftCh);
            }
            if (node.rightCh !== null) {
                queue.enqueue(node.rightCh);
            }
            node = queue.dequeue() || null;
        }
    };
    /**
     * @private
     */
    BSTreeKV.prototype.preorderTraversalAux = function (node, callback, signal) {
        if (node === null || signal.stop) {
            return;
        }
        signal.stop = callback(node.element) === false;
        if (signal.stop) {
            return;
        }
        this.preorderTraversalAux(node.leftCh, callback, signal);
        if (signal.stop) {
            return;
        }
        this.preorderTraversalAux(node.rightCh, callback, signal);
    };
    /**
     * @private
     */
    BSTreeKV.prototype.postorderTraversalAux = function (node, callback, signal) {
        if (node === null || signal.stop) {
            return;
        }
        this.postorderTraversalAux(node.leftCh, callback, signal);
        if (signal.stop) {
            return;
        }
        this.postorderTraversalAux(node.rightCh, callback, signal);
        if (signal.stop) {
            return;
        }
        signal.stop = callback(node.element) === false;
    };
    BSTreeKV.prototype.minimumAux = function (node) {
        while (node != null && node.leftCh !== null) {
            node = node.leftCh;
        }
        return node;
    };
    BSTreeKV.prototype.maximumAux = function (node) {
        while (node != null && node.rightCh !== null) {
            node = node.rightCh;
        }
        return node;
    };
    /**
     * @private
     */
    BSTreeKV.prototype.heightAux = function (node) {
        if (node === null) {
            return -1;
        }
        return Math.max(this.heightAux(node.leftCh), this.heightAux(node.rightCh)) + 1;
    };
    /*
    * @private
    */
    BSTreeKV.prototype.insertNode = function (node) {
        var parent = null;
        var position = this.root;
        while (position !== null) {
            var cmp = this.compare(node.element, position.element);
            if (cmp === 0) {
                return null;
            }
            else if (cmp < 0) {
                parent = position;
                position = position.leftCh;
            }
            else {
                parent = position;
                position = position.rightCh;
            }
        }
        node.parent = parent;
        if (parent === null) {
            // tree is empty
            this.root = node;
        }
        else if (this.compare(node.element, parent.element) < 0) {
            parent.leftCh = node;
        }
        else {
            parent.rightCh = node;
        }
        return node;
    };
    /**
     * @private
     */
    BSTreeKV.prototype.createNode = function (element) {
        return {
            element: element,
            leftCh: null,
            rightCh: null,
            parent: null
        };
    };
    return BSTreeKV;
}());
exports.default = BSTreeKV;
//# sourceMappingURL=BSTreeKV.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/Bag.js":
/*!*************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/Bag.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var util = __webpack_require__(/*! ./util */ "./node_modules/typescript-collections/dist/lib/util.js");
var Dictionary_1 = __webpack_require__(/*! ./Dictionary */ "./node_modules/typescript-collections/dist/lib/Dictionary.js");
var Set_1 = __webpack_require__(/*! ./Set */ "./node_modules/typescript-collections/dist/lib/Set.js");
var Bag = /** @class */ (function () {
    /**
     * Creates an empty bag.
     * @class <p>A bag is a special kind of set in which members are
     * allowed to appear more than once.</p>
     * <p>If the inserted elements are custom objects a function
     * which converts elements to unique strings must be provided. Example:</p>
     *
     * <pre>
     * function petToString(pet) {
     *  return pet.name;
     * }
     * </pre>
     *
     * @constructor
     * @param {function(Object):string=} toStrFunction optional function used
     * to convert elements to strings. If the elements aren't strings or if toString()
     * is not appropriate, a custom function which receives an object and returns a
     * unique string must be provided.
     */
    function Bag(toStrFunction) {
        this.toStrF = toStrFunction || util.defaultToString;
        this.dictionary = new Dictionary_1.default(this.toStrF);
        this.nElements = 0;
    }
    /**
     * Adds nCopies of the specified object to this bag.
     * @param {Object} element element to add.
     * @param {number=} nCopies the number of copies to add, if this argument is
     * undefined 1 copy is added.
     * @return {boolean} true unless element is undefined.
     */
    Bag.prototype.add = function (element, nCopies) {
        if (nCopies === void 0) { nCopies = 1; }
        if (util.isUndefined(element) || nCopies <= 0) {
            return false;
        }
        if (!this.contains(element)) {
            var node = {
                value: element,
                copies: nCopies
            };
            this.dictionary.setValue(element, node);
        }
        else {
            this.dictionary.getValue(element).copies += nCopies;
        }
        this.nElements += nCopies;
        return true;
    };
    /**
     * Counts the number of copies of the specified object in this bag.
     * @param {Object} element the object to search for..
     * @return {number} the number of copies of the object, 0 if not found
     */
    Bag.prototype.count = function (element) {
        if (!this.contains(element)) {
            return 0;
        }
        else {
            return this.dictionary.getValue(element).copies;
        }
    };
    /**
     * Returns true if this bag contains the specified element.
     * @param {Object} element element to search for.
     * @return {boolean} true if this bag contains the specified element,
     * false otherwise.
     */
    Bag.prototype.contains = function (element) {
        return this.dictionary.containsKey(element);
    };
    /**
     * Removes nCopies of the specified object to this bag.
     * If the number of copies to remove is greater than the actual number
     * of copies in the Bag, all copies are removed.
     * @param {Object} element element to remove.
     * @param {number=} nCopies the number of copies to remove, if this argument is
     * undefined 1 copy is removed.
     * @return {boolean} true if at least 1 element was removed.
     */
    Bag.prototype.remove = function (element, nCopies) {
        if (nCopies === void 0) { nCopies = 1; }
        if (util.isUndefined(element) || nCopies <= 0) {
            return false;
        }
        if (!this.contains(element)) {
            return false;
        }
        else {
            var node = this.dictionary.getValue(element);
            if (nCopies > node.copies) {
                this.nElements -= node.copies;
            }
            else {
                this.nElements -= nCopies;
            }
            node.copies -= nCopies;
            if (node.copies <= 0) {
                this.dictionary.remove(element);
            }
            return true;
        }
    };
    /**
     * Returns an array containing all of the elements in this big in arbitrary order,
     * including multiple copies.
     * @return {Array} an array containing all of the elements in this bag.
     */
    Bag.prototype.toArray = function () {
        var a = [];
        var values = this.dictionary.values();
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var node = values_1[_i];
            var element = node.value;
            var copies = node.copies;
            for (var j = 0; j < copies; j++) {
                a.push(element);
            }
        }
        return a;
    };
    /**
     * Returns a set of unique elements in this bag.
     * @return {collections.Set<T>} a set of unique elements in this bag.
     */
    Bag.prototype.toSet = function () {
        var toret = new Set_1.default(this.toStrF);
        var elements = this.dictionary.values();
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var ele = elements_1[_i];
            var value = ele.value;
            toret.add(value);
        }
        return toret;
    };
    /**
     * Executes the provided function once for each element
     * present in this bag, including multiple copies.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element. To break the iteration you can
     * optionally return false.
     */
    Bag.prototype.forEach = function (callback) {
        this.dictionary.forEach(function (k, v) {
            var value = v.value;
            var copies = v.copies;
            for (var i = 0; i < copies; i++) {
                if (callback(value) === false) {
                    return false;
                }
            }
            return true;
        });
    };
    /**
     * Returns the number of elements in this bag.
     * @return {number} the number of elements in this bag.
     */
    Bag.prototype.size = function () {
        return this.nElements;
    };
    /**
     * Returns true if this bag contains no elements.
     * @return {boolean} true if this bag contains no elements.
     */
    Bag.prototype.isEmpty = function () {
        return this.nElements === 0;
    };
    /**
     * Removes all of the elements from this bag.
     */
    Bag.prototype.clear = function () {
        this.nElements = 0;
        this.dictionary.clear();
    };
    return Bag;
}()); // End of bag
exports.default = Bag;
//# sourceMappingURL=Bag.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/Dictionary.js":
/*!********************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/Dictionary.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var util = __webpack_require__(/*! ./util */ "./node_modules/typescript-collections/dist/lib/util.js");
var Dictionary = /** @class */ (function () {
    /**
     * Creates an empty dictionary.
     * @class <p>Dictionaries map keys to values; each key can map to at most one value.
     * This implementation accepts any kind of objects as keys.</p>
     *
     * <p>If the keys are custom objects a function which converts keys to unique
     * strings must be provided. Example:</p>
     * <pre>
     * function petToString(pet) {
     *  return pet.name;
     * }
     * </pre>
     * @constructor
     * @param {function(Object):string=} toStrFunction optional function used
     * to convert keys to strings. If the keys aren't strings or if toString()
     * is not appropriate, a custom function which receives a key and returns a
     * unique string must be provided.
     */
    function Dictionary(toStrFunction) {
        this.table = {};
        this.nElements = 0;
        this.toStr = toStrFunction || util.defaultToString;
    }
    /**
     * Returns the value to which this dictionary maps the specified key.
     * Returns undefined if this dictionary contains no mapping for this key.
     * @param {Object} key key whose associated value is to be returned.
     * @return {*} the value to which this dictionary maps the specified key or
     * undefined if the map contains no mapping for this key.
     */
    Dictionary.prototype.getValue = function (key) {
        var pair = this.table['$' + this.toStr(key)];
        if (util.isUndefined(pair)) {
            return undefined;
        }
        return pair.value;
    };
    /**
     * Associates the specified value with the specified key in this dictionary.
     * If the dictionary previously contained a mapping for this key, the old
     * value is replaced by the specified value.
     * @param {Object} key key with which the specified value is to be
     * associated.
     * @param {Object} value value to be associated with the specified key.
     * @return {*} previous value associated with the specified key, or undefined if
     * there was no mapping for the key or if the key/value are undefined.
     */
    Dictionary.prototype.setValue = function (key, value) {
        if (util.isUndefined(key) || util.isUndefined(value)) {
            return undefined;
        }
        var ret;
        var k = '$' + this.toStr(key);
        var previousElement = this.table[k];
        if (util.isUndefined(previousElement)) {
            this.nElements++;
            ret = undefined;
        }
        else {
            ret = previousElement.value;
        }
        this.table[k] = {
            key: key,
            value: value
        };
        return ret;
    };
    /**
     * Removes the mapping for this key from this dictionary if it is present.
     * @param {Object} key key whose mapping is to be removed from the
     * dictionary.
     * @return {*} previous value associated with specified key, or undefined if
     * there was no mapping for key.
     */
    Dictionary.prototype.remove = function (key) {
        var k = '$' + this.toStr(key);
        var previousElement = this.table[k];
        if (!util.isUndefined(previousElement)) {
            delete this.table[k];
            this.nElements--;
            return previousElement.value;
        }
        return undefined;
    };
    /**
     * Returns an array containing all of the keys in this dictionary.
     * @return {Array} an array containing all of the keys in this dictionary.
     */
    Dictionary.prototype.keys = function () {
        var array = [];
        for (var name_1 in this.table) {
            if (util.has(this.table, name_1)) {
                var pair = this.table[name_1];
                array.push(pair.key);
            }
        }
        return array;
    };
    /**
     * Returns an array containing all of the values in this dictionary.
     * @return {Array} an array containing all of the values in this dictionary.
     */
    Dictionary.prototype.values = function () {
        var array = [];
        for (var name_2 in this.table) {
            if (util.has(this.table, name_2)) {
                var pair = this.table[name_2];
                array.push(pair.value);
            }
        }
        return array;
    };
    /**
     * Executes the provided function once for each key-value pair
     * present in this dictionary.
     * @param {function(Object,Object):*} callback function to execute, it is
     * invoked with two arguments: key and value. To break the iteration you can
     * optionally return false.
     */
    Dictionary.prototype.forEach = function (callback) {
        for (var name_3 in this.table) {
            if (util.has(this.table, name_3)) {
                var pair = this.table[name_3];
                var ret = callback(pair.key, pair.value);
                if (ret === false) {
                    return;
                }
            }
        }
    };
    /**
     * Returns true if this dictionary contains a mapping for the specified key.
     * @param {Object} key key whose presence in this dictionary is to be
     * tested.
     * @return {boolean} true if this dictionary contains a mapping for the
     * specified key.
     */
    Dictionary.prototype.containsKey = function (key) {
        return !util.isUndefined(this.getValue(key));
    };
    /**
     * Removes all mappings from this dictionary.
     * @this {collections.Dictionary}
     */
    Dictionary.prototype.clear = function () {
        this.table = {};
        this.nElements = 0;
    };
    /**
     * Returns the number of keys in this dictionary.
     * @return {number} the number of key-value mappings in this dictionary.
     */
    Dictionary.prototype.size = function () {
        return this.nElements;
    };
    /**
     * Returns true if this dictionary contains no mappings.
     * @return {boolean} true if this dictionary contains no mappings.
     */
    Dictionary.prototype.isEmpty = function () {
        return this.nElements <= 0;
    };
    Dictionary.prototype.toString = function () {
        var toret = '{';
        this.forEach(function (k, v) {
            toret += "\n\t" + k + " : " + v;
        });
        return toret + '\n}';
    };
    return Dictionary;
}()); // End of dictionary
exports.default = Dictionary;
//# sourceMappingURL=Dictionary.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/FactoryDictionary.js":
/*!***************************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/FactoryDictionary.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Dictionary_1 = __webpack_require__(/*! ./Dictionary */ "./node_modules/typescript-collections/dist/lib/Dictionary.js");
var util = __webpack_require__(/*! ./util */ "./node_modules/typescript-collections/dist/lib/util.js");
var FactoryDictionary = /** @class */ (function (_super) {
    __extends(FactoryDictionary, _super);
    /**
     * Creates an empty dictionary.
     * @class <p>Dictionaries map keys to values; each key can map to at most one value.
     * This implementation accepts any kind of objects as keys.</p>
     *
     * <p>The default factory function should return a new object of the provided
     * type. Example:</p>
     * <pre>
     * function petFactory() {
     *  return new Pet();
     * }
     * </pre>
     *
     * <p>If the keys are custom objects a function which converts keys to unique
     * strings must be provided. Example:</p>
     * <pre>
     * function petToString(pet) {
     *  return pet.name;
     * }
     * </pre>
     * @constructor
     * @param {function():V=} defaultFactoryFunction function used to create a
     * default object.
     * @param {function(Object):string=} toStrFunction optional function used
     * to convert keys to strings. If the keys aren't strings or if toString()
     * is not appropriate, a custom function which receives a key and returns a
     * unique string must be provided.
     */
    function FactoryDictionary(defaultFactoryFunction, toStrFunction) {
        var _this = _super.call(this, toStrFunction) || this;
        _this.defaultFactoryFunction = defaultFactoryFunction;
        return _this;
    }
    /**
     * Associates the specified default value with the specified key in this dictionary,
     * if it didn't contain the key yet. If the key existed, the existing value will be used.
     * @param {Object} key key with which the specified value is to be
     * associated.
     * @param {Object} defaultValue default value to be associated with the specified key.
     * @return {*} previous value associated with the specified key, or the default value,
     * if the key didn't exist yet.
     */
    FactoryDictionary.prototype.setDefault = function (key, defaultValue) {
        var currentValue = _super.prototype.getValue.call(this, key);
        if (util.isUndefined(currentValue)) {
            this.setValue(key, defaultValue);
            return defaultValue;
        }
        return currentValue;
    };
    /**
     * Returns the value to which this dictionary maps the specified key.
     * Returns a default value created by the factory passed in the constructor,
     * if this dictionary contains no mapping for this key. The missing key will
     * automatically be added to the dictionary.
     * @param {Object} key key whose associated value is to be returned.
     * @return {*} the value to which this dictionary maps the specified key or
     * a default value if the map contains no mapping for this key.
     */
    FactoryDictionary.prototype.getValue = function (key) {
        return this.setDefault(key, this.defaultFactoryFunction());
    };
    return FactoryDictionary;
}(Dictionary_1.default));
exports.default = FactoryDictionary;
//# sourceMappingURL=FactoryDictionary.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/Heap.js":
/*!**************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/Heap.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var collections = __webpack_require__(/*! ./util */ "./node_modules/typescript-collections/dist/lib/util.js");
var arrays = __webpack_require__(/*! ./arrays */ "./node_modules/typescript-collections/dist/lib/arrays.js");
var Heap = /** @class */ (function () {
    /**
     * Creates an empty Heap.
     * @class
     * <p>A heap is a binary tree, where the nodes maintain the heap property:
     * each node is smaller than each of its children and therefore a MinHeap
     * This implementation uses an array to store elements.</p>
     * <p>If the inserted elements are custom objects a compare function must be provided,
     *  at construction time, otherwise the <=, === and >= operators are
     * used to compare elements. Example:</p>
     *
     * <pre>
     * function compare(a, b) {
     *  if (a is less than b by some ordering criterion) {
     *     return -1;
     *  } if (a is greater than b by the ordering criterion) {
     *     return 1;
     *  }
     *  // a must be equal to b
     *  return 0;
     * }
     * </pre>
     *
     * <p>If a Max-Heap is wanted (greater elements on top) you can a provide a
     * reverse compare function to accomplish that behavior. Example:</p>
     *
     * <pre>
     * function reverseCompare(a, b) {
     *  if (a is less than b by some ordering criterion) {
     *     return 1;
     *  } if (a is greater than b by the ordering criterion) {
     *     return -1;
     *  }
     *  // a must be equal to b
     *  return 0;
     * }
     * </pre>
     *
     * @constructor
     * @param {function(Object,Object):number=} compareFunction optional
     * function used to compare two elements. Must return a negative integer,
     * zero, or a positive integer as the first argument is less than, equal to,
     * or greater than the second.
     */
    function Heap(compareFunction) {
        /**
         * Array used to store the elements of the heap.
         * @type {Array.<Object>}
         * @private
         */
        this.data = [];
        this.compare = compareFunction || collections.defaultCompare;
    }
    /**
     * Returns the index of the left child of the node at the given index.
     * @param {number} nodeIndex The index of the node to get the left child
     * for.
     * @return {number} The index of the left child.
     * @private
     */
    Heap.prototype.leftChildIndex = function (nodeIndex) {
        return (2 * nodeIndex) + 1;
    };
    /**
     * Returns the index of the right child of the node at the given index.
     * @param {number} nodeIndex The index of the node to get the right child
     * for.
     * @return {number} The index of the right child.
     * @private
     */
    Heap.prototype.rightChildIndex = function (nodeIndex) {
        return (2 * nodeIndex) + 2;
    };
    /**
     * Returns the index of the parent of the node at the given index.
     * @param {number} nodeIndex The index of the node to get the parent for.
     * @return {number} The index of the parent.
     * @private
     */
    Heap.prototype.parentIndex = function (nodeIndex) {
        return Math.floor((nodeIndex - 1) / 2);
    };
    /**
     * Returns the index of the smaller child node (if it exists).
     * @param {number} leftChild left child index.
     * @param {number} rightChild right child index.
     * @return {number} the index with the minimum value or -1 if it doesn't
     * exists.
     * @private
     */
    Heap.prototype.minIndex = function (leftChild, rightChild) {
        if (rightChild >= this.data.length) {
            if (leftChild >= this.data.length) {
                return -1;
            }
            else {
                return leftChild;
            }
        }
        else {
            if (this.compare(this.data[leftChild], this.data[rightChild]) <= 0) {
                return leftChild;
            }
            else {
                return rightChild;
            }
        }
    };
    /**
     * Moves the node at the given index up to its proper place in the heap.
     * @param {number} index The index of the node to move up.
     * @private
     */
    Heap.prototype.siftUp = function (index) {
        var parent = this.parentIndex(index);
        while (index > 0 && this.compare(this.data[parent], this.data[index]) > 0) {
            arrays.swap(this.data, parent, index);
            index = parent;
            parent = this.parentIndex(index);
        }
    };
    /**
     * Moves the node at the given index down to its proper place in the heap.
     * @param {number} nodeIndex The index of the node to move down.
     * @private
     */
    Heap.prototype.siftDown = function (nodeIndex) {
        //smaller child index
        var min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
        while (min >= 0 && this.compare(this.data[nodeIndex], this.data[min]) > 0) {
            arrays.swap(this.data, min, nodeIndex);
            nodeIndex = min;
            min = this.minIndex(this.leftChildIndex(nodeIndex), this.rightChildIndex(nodeIndex));
        }
    };
    /**
     * Retrieves but does not remove the root element of this heap.
     * @return {*} The value at the root of the heap. Returns undefined if the
     * heap is empty.
     */
    Heap.prototype.peek = function () {
        if (this.data.length > 0) {
            return this.data[0];
        }
        else {
            return undefined;
        }
    };
    /**
     * Adds the given element into the heap.
     * @param {*} element the element.
     * @return true if the element was added or fals if it is undefined.
     */
    Heap.prototype.add = function (element) {
        if (collections.isUndefined(element)) {
            return false;
        }
        this.data.push(element);
        this.siftUp(this.data.length - 1);
        return true;
    };
    /**
     * Retrieves and removes the root element of this heap.
     * @return {*} The value removed from the root of the heap. Returns
     * undefined if the heap is empty.
     */
    Heap.prototype.removeRoot = function () {
        if (this.data.length > 0) {
            var obj = this.data[0];
            this.data[0] = this.data[this.data.length - 1];
            this.data.splice(this.data.length - 1, 1);
            if (this.data.length > 0) {
                this.siftDown(0);
            }
            return obj;
        }
        return undefined;
    };
    /**
     * Returns true if this heap contains the specified element.
     * @param {Object} element element to search for.
     * @return {boolean} true if this Heap contains the specified element, false
     * otherwise.
     */
    Heap.prototype.contains = function (element) {
        var equF = collections.compareToEquals(this.compare);
        return arrays.contains(this.data, element, equF);
    };
    /**
     * Returns the number of elements in this heap.
     * @return {number} the number of elements in this heap.
     */
    Heap.prototype.size = function () {
        return this.data.length;
    };
    /**
     * Checks if this heap is empty.
     * @return {boolean} true if and only if this heap contains no items; false
     * otherwise.
     */
    Heap.prototype.isEmpty = function () {
        return this.data.length <= 0;
    };
    /**
     * Removes all of the elements from this heap.
     */
    Heap.prototype.clear = function () {
        this.data.length = 0;
    };
    /**
     * Executes the provided function once for each element present in this heap in
     * no particular order.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    Heap.prototype.forEach = function (callback) {
        arrays.forEach(this.data, callback);
    };
    return Heap;
}());
exports.default = Heap;
//# sourceMappingURL=Heap.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/LinkedDictionary.js":
/*!**************************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/LinkedDictionary.js ***!
  \**************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Dictionary_1 = __webpack_require__(/*! ./Dictionary */ "./node_modules/typescript-collections/dist/lib/Dictionary.js");
var util = __webpack_require__(/*! ./util */ "./node_modules/typescript-collections/dist/lib/util.js");
/**
 * This class is used by the LinkedDictionary Internally
 * Has to be a class, not an interface, because it needs to have
 * the 'unlink' function defined.
 */
var LinkedDictionaryPair = /** @class */ (function () {
    function LinkedDictionaryPair(key, value) {
        this.key = key;
        this.value = value;
    }
    LinkedDictionaryPair.prototype.unlink = function () {
        this.prev.next = this.next;
        this.next.prev = this.prev;
    };
    return LinkedDictionaryPair;
}());
/**
 * The head and tail elements of the list have null key and value properties but they
 * usually link to normal nodes.
 */
var HeadOrTailLinkedDictionaryPair = /** @class */ (function () {
    function HeadOrTailLinkedDictionaryPair() {
        this.key = null;
        this.value = null;
    }
    HeadOrTailLinkedDictionaryPair.prototype.unlink = function () {
        this.prev.next = this.next;
        this.next.prev = this.prev;
    };
    return HeadOrTailLinkedDictionaryPair;
}());
function isHeadOrTailLinkedDictionaryPair(p) {
    return !p.next;
}
var LinkedDictionary = /** @class */ (function (_super) {
    __extends(LinkedDictionary, _super);
    function LinkedDictionary(toStrFunction) {
        var _this = _super.call(this, toStrFunction) || this;
        _this.head = new HeadOrTailLinkedDictionaryPair();
        _this.tail = new HeadOrTailLinkedDictionaryPair();
        _this.head.next = _this.tail;
        _this.tail.prev = _this.head;
        return _this;
    }
    /**
     * Inserts the new node to the 'tail' of the list, updating the
     * neighbors, and moving 'this.tail' (the End of List indicator) that
     * to the end.
     */
    LinkedDictionary.prototype.appendToTail = function (entry) {
        var lastNode = this.tail.prev;
        lastNode.next = entry;
        entry.prev = lastNode;
        entry.next = this.tail;
        this.tail.prev = entry;
    };
    /**
     * Retrieves a linked dictionary from the table internally
     */
    LinkedDictionary.prototype.getLinkedDictionaryPair = function (key) {
        if (util.isUndefined(key)) {
            return undefined;
        }
        var k = '$' + this.toStr(key);
        var pair = (this.table[k]);
        return pair;
    };
    /**
     * Returns the value to which this dictionary maps the specified key.
     * Returns undefined if this dictionary contains no mapping for this key.
     * @param {Object} key key whose associated value is to be returned.
     * @return {*} the value to which this dictionary maps the specified key or
     * undefined if the map contains no mapping for this key.
     */
    LinkedDictionary.prototype.getValue = function (key) {
        var pair = this.getLinkedDictionaryPair(key);
        if (!util.isUndefined(pair)) {
            return pair.value;
        }
        return undefined;
    };
    /**
     * Removes the mapping for this key from this dictionary if it is present.
     * Also, if a value is present for this key, the entry is removed from the
     * insertion ordering.
     * @param {Object} key key whose mapping is to be removed from the
     * dictionary.
     * @return {*} previous value associated with specified key, or undefined if
     * there was no mapping for key.
     */
    LinkedDictionary.prototype.remove = function (key) {
        var pair = this.getLinkedDictionaryPair(key);
        if (!util.isUndefined(pair)) {
            _super.prototype.remove.call(this, key); // This will remove it from the table
            pair.unlink(); // This will unlink it from the chain
            return pair.value;
        }
        return undefined;
    };
    /**
     * Removes all mappings from this LinkedDictionary.
     * @this {collections.LinkedDictionary}
     */
    LinkedDictionary.prototype.clear = function () {
        _super.prototype.clear.call(this);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    };
    /**
     * Internal function used when updating an existing KeyValue pair.
     * It places the new value indexed by key into the table, but maintains
     * its place in the linked ordering.
     */
    LinkedDictionary.prototype.replace = function (oldPair, newPair) {
        var k = '$' + this.toStr(newPair.key);
        // set the new Pair's links to existingPair's links
        newPair.next = oldPair.next;
        newPair.prev = oldPair.prev;
        // Delete Existing Pair from the table, unlink it from chain.
        // As a result, the nElements gets decremented by this operation
        this.remove(oldPair.key);
        // Link new Pair in place of where oldPair was,
        // by pointing the old pair's neighbors to it.
        newPair.prev.next = newPair;
        newPair.next.prev = newPair;
        this.table[k] = newPair;
        // To make up for the fact that the number of elements was decremented,
        // We need to increase it by one.
        ++this.nElements;
    };
    /**
     * Associates the specified value with the specified key in this dictionary.
     * If the dictionary previously contained a mapping for this key, the old
     * value is replaced by the specified value.
     * Updating of a key that already exists maintains its place in the
     * insertion order into the map.
     * @param {Object} key key with which the specified value is to be
     * associated.
     * @param {Object} value value to be associated with the specified key.
     * @return {*} previous value associated with the specified key, or undefined if
     * there was no mapping for the key or if the key/value are undefined.
     */
    LinkedDictionary.prototype.setValue = function (key, value) {
        if (util.isUndefined(key) || util.isUndefined(value)) {
            return undefined;
        }
        var existingPair = this.getLinkedDictionaryPair(key);
        var newPair = new LinkedDictionaryPair(key, value);
        var k = '$' + this.toStr(key);
        // If there is already an element for that key, we
        // keep it's place in the LinkedList
        if (!util.isUndefined(existingPair)) {
            this.replace(existingPair, newPair);
            return existingPair.value;
        }
        else {
            this.appendToTail(newPair);
            this.table[k] = newPair;
            ++this.nElements;
            return undefined;
        }
    };
    /**
     * Returns an array containing all of the keys in this LinkedDictionary, ordered
     * by insertion order.
     * @return {Array} an array containing all of the keys in this LinkedDictionary,
     * ordered by insertion order.
     */
    LinkedDictionary.prototype.keys = function () {
        var array = [];
        this.forEach(function (key, value) {
            array.push(key);
        });
        return array;
    };
    /**
     * Returns an array containing all of the values in this LinkedDictionary, ordered by
     * insertion order.
     * @return {Array} an array containing all of the values in this LinkedDictionary,
     * ordered by insertion order.
     */
    LinkedDictionary.prototype.values = function () {
        var array = [];
        this.forEach(function (key, value) {
            array.push(value);
        });
        return array;
    };
    /**
     * Executes the provided function once for each key-value pair
     * present in this LinkedDictionary. It is done in the order of insertion
     * into the LinkedDictionary
     * @param {function(Object,Object):*} callback function to execute, it is
     * invoked with two arguments: key and value. To break the iteration you can
     * optionally return false.
     */
    LinkedDictionary.prototype.forEach = function (callback) {
        var crawlNode = this.head.next;
        while (!isHeadOrTailLinkedDictionaryPair(crawlNode)) {
            var ret = callback(crawlNode.key, crawlNode.value);
            if (ret === false) {
                return;
            }
            crawlNode = crawlNode.next;
        }
    };
    return LinkedDictionary;
}(Dictionary_1.default)); // End of LinkedDictionary
exports.default = LinkedDictionary;
// /**
//  * Returns true if this dictionary is equal to the given dictionary.
//  * Two dictionaries are equal if they contain the same mappings.
//  * @param {collections.Dictionary} other the other dictionary.
//  * @param {function(Object,Object):boolean=} valuesEqualFunction optional
//  * function used to check if two values are equal.
//  * @return {boolean} true if this dictionary is equal to the given dictionary.
//  */
// collections.Dictionary.prototype.equals = function(other,valuesEqualFunction) {
// 	const eqF = valuesEqualFunction || collections.defaultEquals;
// 	if(!(other instanceof collections.Dictionary)){
// 		return false;
// 	}
// 	if(this.size() !== other.size()){
// 		return false;
// 	}
// 	return this.equalsAux(this.firstNode,other.firstNode,eqF);
// }
//# sourceMappingURL=LinkedDictionary.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/LinkedList.js":
/*!********************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/LinkedList.js ***!
  \********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var util = __webpack_require__(/*! ./util */ "./node_modules/typescript-collections/dist/lib/util.js");
var arrays = __webpack_require__(/*! ./arrays */ "./node_modules/typescript-collections/dist/lib/arrays.js");
var LinkedList = /** @class */ (function () {
    /**
     * Creates an empty Linked List.
     * @class A linked list is a data structure consisting of a group of nodes
     * which together represent a sequence.
     * @constructor
     */
    function LinkedList() {
        /**
         * First node in the list
         * @type {Object}
         * @private
         */
        this.firstNode = null;
        /**
         * Last node in the list
         * @type {Object}
         * @private
         */
        this.lastNode = null;
        /**
         * Number of elements in the list
         * @type {number}
         * @private
         */
        this.nElements = 0;
    }
    /**
     * Adds an element to this list.
     * @param {Object} item element to be added.
     * @param {number=} index optional index to add the element. If no index is specified
     * the element is added to the end of this list.
     * @return {boolean} true if the element was added or false if the index is invalid
     * or if the element is undefined.
     */
    LinkedList.prototype.add = function (item, index) {
        if (util.isUndefined(index)) {
            index = this.nElements;
        }
        if (index < 0 || index > this.nElements || util.isUndefined(item)) {
            return false;
        }
        var newNode = this.createNode(item);
        if (this.nElements === 0 || this.lastNode === null) {
            // First node in the list.
            this.firstNode = newNode;
            this.lastNode = newNode;
        }
        else if (index === this.nElements) {
            // Insert at the end.
            this.lastNode.next = newNode;
            this.lastNode = newNode;
        }
        else if (index === 0) {
            // Change first node.
            newNode.next = this.firstNode;
            this.firstNode = newNode;
        }
        else {
            var prev = this.nodeAtIndex(index - 1);
            if (prev === null) {
                return false;
            }
            newNode.next = prev.next;
            prev.next = newNode;
        }
        this.nElements++;
        return true;
    };
    /**
     * Returns the first element in this list.
     * @return {*} the first element of the list or undefined if the list is
     * empty.
     */
    LinkedList.prototype.first = function () {
        if (this.firstNode !== null) {
            return this.firstNode.element;
        }
        return undefined;
    };
    /**
     * Returns the last element in this list.
     * @return {*} the last element in the list or undefined if the list is
     * empty.
     */
    LinkedList.prototype.last = function () {
        if (this.lastNode !== null) {
            return this.lastNode.element;
        }
        return undefined;
    };
    /**
     * Returns the element at the specified position in this list.
     * @param {number} index desired index.
     * @return {*} the element at the given index or undefined if the index is
     * out of bounds.
     */
    LinkedList.prototype.elementAtIndex = function (index) {
        var node = this.nodeAtIndex(index);
        if (node === null) {
            return undefined;
        }
        return node.element;
    };
    /**
     * Returns the index in this list of the first occurrence of the
     * specified element, or -1 if the List does not contain this element.
     * <p>If the elements inside this list are
     * not comparable with the === operator a custom equals function should be
     * provided to perform searches, the function must receive two arguments and
     * return true if they are equal, false otherwise. Example:</p>
     *
     * <pre>
     * const petsAreEqualByName = function(pet1, pet2) {
     *  return pet1.name === pet2.name;
     * }
     * </pre>
     * @param {Object} item element to search for.
     * @param {function(Object,Object):boolean=} equalsFunction Optional
     * function used to check if two elements are equal.
     * @return {number} the index in this list of the first occurrence
     * of the specified element, or -1 if this list does not contain the
     * element.
     */
    LinkedList.prototype.indexOf = function (item, equalsFunction) {
        var equalsF = equalsFunction || util.defaultEquals;
        if (util.isUndefined(item)) {
            return -1;
        }
        var currentNode = this.firstNode;
        var index = 0;
        while (currentNode !== null) {
            if (equalsF(currentNode.element, item)) {
                return index;
            }
            index++;
            currentNode = currentNode.next;
        }
        return -1;
    };
    /**
     * Returns true if this list contains the specified element.
     * <p>If the elements inside the list are
     * not comparable with the === operator a custom equals function should be
     * provided to perform searches, the function must receive two arguments and
     * return true if they are equal, false otherwise. Example:</p>
     *
     * <pre>
     * const petsAreEqualByName = function(pet1, pet2) {
     *  return pet1.name === pet2.name;
     * }
     * </pre>
     * @param {Object} item element to search for.
     * @param {function(Object,Object):boolean=} equalsFunction Optional
     * function used to check if two elements are equal.
     * @return {boolean} true if this list contains the specified element, false
     * otherwise.
     */
    LinkedList.prototype.contains = function (item, equalsFunction) {
        return (this.indexOf(item, equalsFunction) >= 0);
    };
    /**
     * Removes the first occurrence of the specified element in this list.
     * <p>If the elements inside the list are
     * not comparable with the === operator a custom equals function should be
     * provided to perform searches, the function must receive two arguments and
     * return true if they are equal, false otherwise. Example:</p>
     *
     * <pre>
     * const petsAreEqualByName = function(pet1, pet2) {
     *  return pet1.name === pet2.name;
     * }
     * </pre>
     * @param {Object} item element to be removed from this list, if present.
     * @return {boolean} true if the list contained the specified element.
     */
    LinkedList.prototype.remove = function (item, equalsFunction) {
        var equalsF = equalsFunction || util.defaultEquals;
        if (this.nElements < 1 || util.isUndefined(item)) {
            return false;
        }
        var previous = null;
        var currentNode = this.firstNode;
        while (currentNode !== null) {
            if (equalsF(currentNode.element, item)) {
                if (previous === null) {
                    this.firstNode = currentNode.next;
                    if (currentNode === this.lastNode) {
                        this.lastNode = null;
                    }
                }
                else if (currentNode === this.lastNode) {
                    this.lastNode = previous;
                    previous.next = currentNode.next;
                    currentNode.next = null;
                }
                else {
                    previous.next = currentNode.next;
                    currentNode.next = null;
                }
                this.nElements--;
                return true;
            }
            previous = currentNode;
            currentNode = currentNode.next;
        }
        return false;
    };
    /**
     * Removes all of the elements from this list.
     */
    LinkedList.prototype.clear = function () {
        this.firstNode = null;
        this.lastNode = null;
        this.nElements = 0;
    };
    /**
     * Returns true if this list is equal to the given list.
     * Two lists are equal if they have the same elements in the same order.
     * @param {LinkedList} other the other list.
     * @param {function(Object,Object):boolean=} equalsFunction optional
     * function used to check if two elements are equal. If the elements in the lists
     * are custom objects you should provide a function, otherwise
     * the === operator is used to check equality between elements.
     * @return {boolean} true if this list is equal to the given list.
     */
    LinkedList.prototype.equals = function (other, equalsFunction) {
        var eqF = equalsFunction || util.defaultEquals;
        if (!(other instanceof LinkedList)) {
            return false;
        }
        if (this.size() !== other.size()) {
            return false;
        }
        return this.equalsAux(this.firstNode, other.firstNode, eqF);
    };
    /**
     * @private
     */
    LinkedList.prototype.equalsAux = function (n1, n2, eqF) {
        while (n1 !== null && n2 !== null) {
            if (!eqF(n1.element, n2.element)) {
                return false;
            }
            n1 = n1.next;
            n2 = n2.next;
        }
        return true;
    };
    /**
     * Removes the element at the specified position in this list.
     * @param {number} index given index.
     * @return {*} removed element or undefined if the index is out of bounds.
     */
    LinkedList.prototype.removeElementAtIndex = function (index) {
        if (index < 0 || index >= this.nElements || this.firstNode === null || this.lastNode === null) {
            return undefined;
        }
        var element;
        if (this.nElements === 1) {
            //First node in the list.
            element = this.firstNode.element;
            this.firstNode = null;
            this.lastNode = null;
        }
        else {
            var previous = this.nodeAtIndex(index - 1);
            if (previous === null) {
                element = this.firstNode.element;
                this.firstNode = this.firstNode.next;
            }
            else if (previous.next === this.lastNode) {
                element = this.lastNode.element;
                this.lastNode = previous;
            }
            if (previous !== null && previous.next !== null) {
                element = previous.next.element;
                previous.next = previous.next.next;
            }
        }
        this.nElements--;
        return element;
    };
    /**
     * Executes the provided function once for each element present in this list in order.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    LinkedList.prototype.forEach = function (callback) {
        var currentNode = this.firstNode;
        while (currentNode !== null) {
            if (callback(currentNode.element) === false) {
                break;
            }
            currentNode = currentNode.next;
        }
    };
    /**
     * Reverses the order of the elements in this linked list (makes the last
     * element first, and the first element last).
     */
    LinkedList.prototype.reverse = function () {
        var previous = null;
        var current = this.firstNode;
        var temp = null;
        while (current !== null) {
            temp = current.next;
            current.next = previous;
            previous = current;
            current = temp;
        }
        temp = this.firstNode;
        this.firstNode = this.lastNode;
        this.lastNode = temp;
    };
    /**
     * Returns an array containing all of the elements in this list in proper
     * sequence.
     * @return {Array.<*>} an array containing all of the elements in this list,
     * in proper sequence.
     */
    LinkedList.prototype.toArray = function () {
        var array = [];
        var currentNode = this.firstNode;
        while (currentNode !== null) {
            array.push(currentNode.element);
            currentNode = currentNode.next;
        }
        return array;
    };
    /**
     * Returns the number of elements in this list.
     * @return {number} the number of elements in this list.
     */
    LinkedList.prototype.size = function () {
        return this.nElements;
    };
    /**
     * Returns true if this list contains no elements.
     * @return {boolean} true if this list contains no elements.
     */
    LinkedList.prototype.isEmpty = function () {
        return this.nElements <= 0;
    };
    LinkedList.prototype.toString = function () {
        return arrays.toString(this.toArray());
    };
    /**
     * @private
     */
    LinkedList.prototype.nodeAtIndex = function (index) {
        if (index < 0 || index >= this.nElements) {
            return null;
        }
        if (index === (this.nElements - 1)) {
            return this.lastNode;
        }
        var node = this.firstNode;
        for (var i = 0; i < index && node !== null; i++) {
            node = node.next;
        }
        return node;
    };
    /**
     * @private
     */
    LinkedList.prototype.createNode = function (item) {
        return {
            element: item,
            next: null
        };
    };
    return LinkedList;
}()); // End of linked list
exports.default = LinkedList;
//# sourceMappingURL=LinkedList.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/MultiDictionary.js":
/*!*************************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/MultiDictionary.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var util = __webpack_require__(/*! ./util */ "./node_modules/typescript-collections/dist/lib/util.js");
var Dictionary_1 = __webpack_require__(/*! ./Dictionary */ "./node_modules/typescript-collections/dist/lib/Dictionary.js");
var arrays = __webpack_require__(/*! ./arrays */ "./node_modules/typescript-collections/dist/lib/arrays.js");
var MultiDictionary = /** @class */ (function () {
    /**
     * Creates an empty multi dictionary.
     * @class <p>A multi dictionary is a special kind of dictionary that holds
     * multiple values against each key. Setting a value into the dictionary will
     * add the value to an array at that key. Getting a key will return an array,
     * holding all the values set to that key.
     * You can configure to allow duplicates in the values.
     * This implementation accepts any kind of objects as keys.</p>
     *
     * <p>If the keys are custom objects a function which converts keys to strings must be
     * provided. Example:</p>
     *
     * <pre>
     * function petToString(pet) {
     *     return pet.name;
     * }
     * </pre>
     * <p>If the values are custom objects a function to check equality between values
     * must be provided. Example:</p>
     *
     * <pre>
     * function petsAreEqualByAge(pet1,pet2) {
     *     return pet1.age === pet2.age;
     * }
     * </pre>
     * @constructor
     * @param {function(Object):string=} toStrFunction optional function
     * to convert keys to strings. If the keys aren't strings or if toString()
     * is not appropriate, a custom function which receives a key and returns a
     * unique string must be provided.
     * @param {function(Object,Object):boolean=} valuesEqualsFunction optional
     * function to check if two values are equal.
     *
     * @param allowDuplicateValues
     */
    function MultiDictionary(toStrFunction, valuesEqualsFunction, allowDuplicateValues) {
        if (allowDuplicateValues === void 0) { allowDuplicateValues = false; }
        this.dict = new Dictionary_1.default(toStrFunction);
        this.equalsF = valuesEqualsFunction || util.defaultEquals;
        this.allowDuplicate = allowDuplicateValues;
    }
    /**
     * Returns an array holding the values to which this dictionary maps
     * the specified key.
     * Returns an empty array if this dictionary contains no mappings for this key.
     * @param {Object} key key whose associated values are to be returned.
     * @return {Array} an array holding the values to which this dictionary maps
     * the specified key.
     */
    MultiDictionary.prototype.getValue = function (key) {
        var values = this.dict.getValue(key);
        if (util.isUndefined(values)) {
            return [];
        }
        return arrays.copy(values);
    };
    /**
     * Adds the value to the array associated with the specified key, if
     * it is not already present.
     * @param {Object} key key with which the specified value is to be
     * associated.
     * @param {Object} value the value to add to the array at the key
     * @return {boolean} true if the value was not already associated with that key.
     */
    MultiDictionary.prototype.setValue = function (key, value) {
        if (util.isUndefined(key) || util.isUndefined(value)) {
            return false;
        }
        var array = this.dict.getValue(key);
        if (util.isUndefined(array)) {
            this.dict.setValue(key, [value]);
            return true;
        }
        if (!this.allowDuplicate) {
            if (arrays.contains(array, value, this.equalsF)) {
                return false;
            }
        }
        array.push(value);
        return true;
    };
    /**
     * Removes the specified values from the array of values associated with the
     * specified key. If a value isn't given, all values associated with the specified
     * key are removed.
     * @param {Object} key key whose mapping is to be removed from the
     * dictionary.
     * @param {Object=} value optional argument to specify the value to remove
     * from the array associated with the specified key.
     * @return {*} true if the dictionary changed, false if the key doesn't exist or
     * if the specified value isn't associated with the specified key.
     */
    MultiDictionary.prototype.remove = function (key, value) {
        if (util.isUndefined(value)) {
            var v = this.dict.remove(key);
            return !util.isUndefined(v);
        }
        var array = this.dict.getValue(key);
        if (!util.isUndefined(array) && arrays.remove(array, value, this.equalsF)) {
            if (array.length === 0) {
                this.dict.remove(key);
            }
            return true;
        }
        return false;
    };
    /**
     * Returns an array containing all of the keys in this dictionary.
     * @return {Array} an array containing all of the keys in this dictionary.
     */
    MultiDictionary.prototype.keys = function () {
        return this.dict.keys();
    };
    /**
     * Returns an array containing all of the values in this dictionary.
     * @return {Array} an array containing all of the values in this dictionary.
     */
    MultiDictionary.prototype.values = function () {
        var values = this.dict.values();
        var array = [];
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var v = values_1[_i];
            for (var _a = 0, v_1 = v; _a < v_1.length; _a++) {
                var w = v_1[_a];
                array.push(w);
            }
        }
        return array;
    };
    /**
     * Returns true if this dictionary at least one value associatted the specified key.
     * @param {Object} key key whose presence in this dictionary is to be
     * tested.
     * @return {boolean} true if this dictionary at least one value associatted
     * the specified key.
     */
    MultiDictionary.prototype.containsKey = function (key) {
        return this.dict.containsKey(key);
    };
    /**
     * Removes all mappings from this dictionary.
     */
    MultiDictionary.prototype.clear = function () {
        this.dict.clear();
    };
    /**
     * Returns the number of keys in this dictionary.
     * @return {number} the number of key-value mappings in this dictionary.
     */
    MultiDictionary.prototype.size = function () {
        return this.dict.size();
    };
    /**
     * Returns true if this dictionary contains no mappings.
     * @return {boolean} true if this dictionary contains no mappings.
     */
    MultiDictionary.prototype.isEmpty = function () {
        return this.dict.isEmpty();
    };
    return MultiDictionary;
}()); // end of multi dictionary
exports.default = MultiDictionary;
//# sourceMappingURL=MultiDictionary.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/MultiRootTree.js":
/*!***********************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/MultiRootTree.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Direction;
(function (Direction) {
    Direction[Direction["BEFORE"] = 0] = "BEFORE";
    Direction[Direction["AFTER"] = 1] = "AFTER";
    Direction[Direction["INSIDE_AT_END"] = 2] = "INSIDE_AT_END";
    Direction[Direction["INSIDE_AT_START"] = 3] = "INSIDE_AT_START";
})(Direction || (Direction = {}));
var MultiRootTree = /** @class */ (function () {
    function MultiRootTree(rootIds, nodes) {
        if (rootIds === void 0) { rootIds = []; }
        if (nodes === void 0) { nodes = {}; }
        this.rootIds = rootIds;
        this.nodes = nodes;
        this.initRootIds();
        this.initNodes();
    }
    MultiRootTree.prototype.initRootIds = function () {
        for (var _i = 0, _a = this.rootIds; _i < _a.length; _i++) {
            var rootId = _a[_i];
            this.createEmptyNodeIfNotExist(rootId);
        }
    };
    MultiRootTree.prototype.initNodes = function () {
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                for (var _i = 0, _a = this.nodes[nodeKey]; _i < _a.length; _i++) {
                    var nodeListItem = _a[_i];
                    this.createEmptyNodeIfNotExist(nodeListItem);
                }
            }
        }
    };
    MultiRootTree.prototype.createEmptyNodeIfNotExist = function (nodeKey) {
        if (!this.nodes[nodeKey]) {
            this.nodes[nodeKey] = [];
        }
    };
    MultiRootTree.prototype.getRootIds = function () {
        var clone = this.rootIds.slice();
        return clone;
    };
    MultiRootTree.prototype.getNodes = function () {
        var clone = {};
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                clone[nodeKey] = this.nodes[nodeKey].slice();
            }
        }
        return clone;
    };
    MultiRootTree.prototype.getObject = function () {
        return {
            rootIds: this.getRootIds(),
            nodes: this.getNodes(),
        };
    };
    MultiRootTree.prototype.toObject = function () {
        return this.getObject();
    };
    MultiRootTree.prototype.flatten = function () {
        var _this = this;
        var extraPropsObject = [];
        for (var i = 0; i < this.rootIds.length; i++) {
            var rootId = this.rootIds[i];
            extraPropsObject.push({
                id: rootId,
                level: 0,
                hasParent: false,
                childrenCount: 0,
            });
            traverse(rootId, this.nodes, extraPropsObject, 0);
        }
        for (var _i = 0, extraPropsObject_1 = extraPropsObject; _i < extraPropsObject_1.length; _i++) {
            var o = extraPropsObject_1[_i];
            o.childrenCount = countChildren(o.id);
        }
        return extraPropsObject;
        function countChildren(id) {
            if (!_this.nodes[id]) {
                return 0;
            }
            else {
                var childrenCount = _this.nodes[id].length;
                return childrenCount;
            }
        }
        function traverse(startId, nodes, returnArray, level) {
            if (level === void 0) { level = 0; }
            if (!startId || !nodes || !returnArray || !nodes[startId]) {
                return;
            }
            level++;
            var idsList = nodes[startId];
            for (var i = 0; i < idsList.length; i++) {
                var id = idsList[i];
                returnArray.push({ id: id, level: level, hasParent: true });
                traverse(id, nodes, returnArray, level);
            }
            level--;
        }
    };
    MultiRootTree.prototype.moveIdBeforeId = function (moveId, beforeId) {
        return this.moveId(moveId, beforeId, Direction.BEFORE);
    };
    MultiRootTree.prototype.moveIdAfterId = function (moveId, afterId) {
        return this.moveId(moveId, afterId, Direction.AFTER);
    };
    MultiRootTree.prototype.moveIdIntoId = function (moveId, insideId, atStart) {
        if (atStart === void 0) { atStart = true; }
        if (atStart) {
            return this.moveId(moveId, insideId, Direction.INSIDE_AT_START);
        }
        else {
            return this.moveId(moveId, insideId, Direction.INSIDE_AT_END);
        }
    };
    MultiRootTree.prototype.swapRootIdWithRootId = function (rootId, withRootId) {
        var leftIndex = this.findRootId(rootId);
        var rightIndex = this.findRootId(withRootId);
        this.swapRootPositionWithRootPosition(leftIndex, rightIndex);
    };
    MultiRootTree.prototype.swapRootPositionWithRootPosition = function (swapRootPosition, withRootPosition) {
        var temp = this.rootIds[withRootPosition];
        this.rootIds[withRootPosition] = this.rootIds[swapRootPosition];
        this.rootIds[swapRootPosition] = temp;
    };
    MultiRootTree.prototype.deleteId = function (id) {
        this.rootDeleteId(id);
        this.nodeAndSubNodesDelete(id);
        this.nodeRefrencesDelete(id);
    };
    MultiRootTree.prototype.insertIdBeforeId = function (beforeId, insertId) {
        var foundRootIdIndex = this.findRootId(beforeId);
        if (foundRootIdIndex > -1) {
            this.insertIdIntoRoot(insertId, foundRootIdIndex);
        }
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                var foundNodeIdIndex = this.findNodeId(nodeKey, beforeId);
                if (foundNodeIdIndex > -1) {
                    this.insertIdIntoNode(nodeKey, insertId, foundNodeIdIndex);
                }
            }
        }
    };
    MultiRootTree.prototype.insertIdAfterId = function (belowId, insertId) {
        var foundRootIdIndex = this.findRootId(belowId);
        if (foundRootIdIndex > -1) {
            this.insertIdIntoRoot(insertId, foundRootIdIndex + 1);
        }
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                var foundNodeIdIndex = this.findNodeId(nodeKey, belowId);
                if (foundNodeIdIndex > -1) {
                    this.insertIdIntoNode(nodeKey, insertId, foundNodeIdIndex + 1);
                }
            }
        }
    };
    MultiRootTree.prototype.insertIdIntoId = function (insideId, insertId) {
        this.nodeInsertAtEnd(insideId, insertId);
        this.nodes[insertId] = [];
    };
    MultiRootTree.prototype.insertIdIntoRoot = function (id, position) {
        if (position === undefined) {
            this.rootInsertAtEnd(id);
        }
        else {
            if (position < 0) {
                var length_1 = this.rootIds.length;
                this.rootIds.splice((position + length_1 + 1), 0, id);
            }
            else {
                this.rootIds.splice(position, 0, id);
            }
        }
        this.nodes[id] = this.nodes[id] || [];
    };
    MultiRootTree.prototype.insertIdIntoNode = function (nodeKey, id, position) {
        this.nodes[nodeKey] = this.nodes[nodeKey] || [];
        this.nodes[id] = this.nodes[id] || [];
        if (position === undefined) {
            this.nodeInsertAtEnd(nodeKey, id);
        }
        else {
            if (position < 0) {
                var length_2 = this.nodes[nodeKey].length;
                this.nodes[nodeKey].splice((position + length_2 + 1), 0, id);
            }
            else {
                this.nodes[nodeKey].splice(position, 0, id);
            }
        }
    };
    MultiRootTree.prototype.moveId = function (moveId, beforeId, direction) {
        var sourceId = moveId;
        var sourceRootIndex = this.findRootId(sourceId);
        var sourceNodeKey;
        var sourceNodeIdIndex;
        if (this.nodes[beforeId]) {
            sourceNodeKey = beforeId;
        }
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                sourceNodeIdIndex = this.findNodeId(nodeKey, beforeId);
                break;
            }
        }
        // got all
        var targetId = beforeId;
        var targetRootIndex = this.findRootId(targetId);
        var targetNodeKey;
        var targetNodeIdIndex;
        if (this.nodes[beforeId]) {
            targetNodeKey = beforeId;
        }
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                targetNodeIdIndex = this.findNodeId(nodeKey, beforeId);
                break;
            }
        }
        // got all
        if (sourceRootIndex > -1) {
            if (targetRootIndex > -1) {
                // moving root to root
                // console.log(`Moving ROOT to ROOT`);
                // console.log(`RootIds:`);
                // console.log(this.rootIds);
                // console.log(`TargetIndex=${targetRootIndex}, SourceIndex=${sourceRootIndex}`);
                // console.log(`TargetId=${targetId}, SourceId=${sourceId}`);
                this.rootDelete(sourceRootIndex); // indexes change now
                if (targetRootIndex > sourceRootIndex) {
                    targetRootIndex--;
                }
                else {
                }
                switch (direction) {
                    case Direction.BEFORE:
                        this.insertIdIntoRoot(sourceId, targetRootIndex);
                        break;
                    case Direction.AFTER:
                        this.insertIdIntoRoot(sourceId, targetRootIndex + 1);
                        break;
                    case Direction.INSIDE_AT_START:
                        this.nodeInsertAtStart(targetId, sourceId);
                        break;
                    case Direction.INSIDE_AT_END:
                        this.nodeInsertAtEnd(targetId, sourceId);
                        break;
                }
            }
            else {
                // moving root (source) ABOVE node (target)
                // will remove one entry from roots
                this.rootDelete(sourceRootIndex);
                for (var nodeKey in this.nodes) {
                    if (this.nodes.hasOwnProperty(nodeKey)) {
                        var index = this.findNodeId(nodeKey, targetId);
                        if (index > -1) {
                            switch (direction) {
                                case Direction.BEFORE:
                                    this.insertIdIntoNode(nodeKey, sourceId, index);
                                    break;
                                case Direction.AFTER:
                                    this.insertIdIntoNode(nodeKey, sourceId, index + 1);
                                    break;
                                case Direction.INSIDE_AT_START:
                                    this.nodeInsertAtStart(targetId, sourceId);
                                    break;
                                case Direction.INSIDE_AT_END:
                                    this.nodeInsertAtEnd(targetId, sourceId);
                                    break;
                            }
                            break;
                        }
                    }
                }
            }
        }
        else {
            if (targetRootIndex > -1) {
                // moving node (source) ABOVE root (target)
                // delete source id from each node
                for (var nodeKey in this.nodes) {
                    if (this.nodes.hasOwnProperty(nodeKey)) {
                        var index = this.findNodeId(nodeKey, sourceId);
                        if (index > -1) {
                            // this.nodeInsertId(nodeKey, sourceId, index);
                            this.nodeDeleteAtIndex(nodeKey, index);
                            break;
                        }
                    }
                }
                switch (direction) {
                    case Direction.BEFORE:
                        this.insertIdIntoRoot(sourceId, targetRootIndex);
                        break;
                    case Direction.AFTER:
                        this.insertIdIntoRoot(sourceId, targetRootIndex + 1);
                        break;
                    case Direction.INSIDE_AT_START:
                        this.nodeInsertAtStart(targetId, sourceId);
                        break;
                    case Direction.INSIDE_AT_END:
                        this.nodeInsertAtEnd(targetId, sourceId);
                        break;
                }
            }
            else {
                // moving node (source) ABOVE node (target)
                // delete source id from each node
                for (var nodeKey in this.nodes) {
                    if (this.nodes.hasOwnProperty(nodeKey)) {
                        var index = this.findNodeId(nodeKey, sourceId);
                        if (index > -1) {
                            this.nodeDeleteAtIndex(nodeKey, index);
                            break;
                        }
                    }
                }
                for (var nodeKey in this.nodes) {
                    if (this.nodes.hasOwnProperty(nodeKey)) {
                        var index = this.findNodeId(nodeKey, targetId);
                        if (index > -1) {
                            switch (direction) {
                                case Direction.BEFORE:
                                    this.insertIdIntoNode(nodeKey, sourceId, index);
                                    break;
                                case Direction.AFTER:
                                    this.insertIdIntoNode(nodeKey, sourceId, index + 1);
                                    break;
                                case Direction.INSIDE_AT_START:
                                    this.nodeInsertAtStart(targetId, sourceId);
                                    break;
                                case Direction.INSIDE_AT_END:
                                    this.nodeInsertAtEnd(targetId, sourceId);
                                    break;
                            }
                            break;
                        }
                    }
                }
            }
        }
    };
    MultiRootTree.prototype.swapArrayElements = function (arr, indexA, indexB) {
        var temp = arr[indexA];
        arr[indexA] = arr[indexB];
        arr[indexB] = temp;
        return arr;
    };
    MultiRootTree.prototype.rootDeleteId = function (id) {
        var index = this.findRootId(id);
        if (index > -1) {
            this.rootDelete(index);
        }
    };
    MultiRootTree.prototype.nodeAndSubNodesDelete = function (nodeKey) {
        var toDeleteLater = [];
        for (var i = 0; i < this.nodes[nodeKey].length; i++) {
            var id = this.nodes[nodeKey][i];
            this.nodeAndSubNodesDelete(id);
            toDeleteLater.push(nodeKey);
        }
        this.nodeDelete(nodeKey);
        for (var i = 0; i < toDeleteLater.length; i++) {
            this.nodeDelete(toDeleteLater[i]);
        }
    };
    MultiRootTree.prototype.nodeRefrencesDelete = function (id) {
        for (var nodeKey in this.nodes) {
            if (this.nodes.hasOwnProperty(nodeKey)) {
                for (var i = 0; i < this.nodes[nodeKey].length; i++) {
                    var targetId = this.nodes[nodeKey][i];
                    if (targetId === id) {
                        this.nodeDeleteAtIndex(nodeKey, i);
                    }
                }
            }
        }
    };
    MultiRootTree.prototype.nodeDelete = function (nodeKey) {
        delete this.nodes[nodeKey];
    };
    MultiRootTree.prototype.findRootId = function (id) {
        return this.rootIds.indexOf(id);
    };
    MultiRootTree.prototype.findNodeId = function (nodeKey, id) {
        return this.nodes[nodeKey].indexOf(id);
    };
    MultiRootTree.prototype.findNode = function (nodeKey) {
        return this.nodes[nodeKey];
    };
    MultiRootTree.prototype.nodeInsertAtStart = function (nodeKey, id) {
        this.nodes[nodeKey].unshift(id);
    };
    MultiRootTree.prototype.nodeInsertAtEnd = function (nodeKey, id) {
        this.nodes[nodeKey].push(id);
    };
    MultiRootTree.prototype.rootDelete = function (index) {
        this.rootIds.splice(index, 1);
    };
    MultiRootTree.prototype.nodeDeleteAtIndex = function (nodeKey, index) {
        this.nodes[nodeKey].splice(index, 1);
    };
    MultiRootTree.prototype.rootInsertAtStart = function (id) {
        this.rootIds.unshift(id);
    };
    MultiRootTree.prototype.rootInsertAtEnd = function (id) {
        this.rootIds.push(id);
    };
    return MultiRootTree;
}());
exports.default = MultiRootTree;
//# sourceMappingURL=MultiRootTree.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/PriorityQueue.js":
/*!***********************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/PriorityQueue.js ***!
  \***********************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var util = __webpack_require__(/*! ./util */ "./node_modules/typescript-collections/dist/lib/util.js");
var Heap_1 = __webpack_require__(/*! ./Heap */ "./node_modules/typescript-collections/dist/lib/Heap.js");
var PriorityQueue = /** @class */ (function () {
    /**
     * Creates an empty priority queue.
     * @class <p>In a priority queue each element is associated with a "priority",
     * elements are dequeued in highest-priority-first order (the elements with the
     * highest priority are dequeued first). Priority Queues are implemented as heaps.
     * If the inserted elements are custom objects a compare function must be provided,
     * otherwise the <=, === and >= operators are used to compare object priority.</p>
     * <pre>
     * function compare(a, b) {
     *  if (a is less than b by some ordering criterion) {
     *     return -1;
     *  } if (a is greater than b by the ordering criterion) {
     *     return 1;
     *  }
     *  // a must be equal to b
     *  return 0;
     * }
     * </pre>
     * @constructor
     * @param {function(Object,Object):number=} compareFunction optional
     * function used to compare two element priorities. Must return a negative integer,
     * zero, or a positive integer as the first argument is less than, equal to,
     * or greater than the second.
     */
    function PriorityQueue(compareFunction) {
        this.heap = new Heap_1.default(util.reverseCompareFunction(compareFunction));
    }
    /**
     * Inserts the specified element into this priority queue.
     * @param {Object} element the element to insert.
     * @return {boolean} true if the element was inserted, or false if it is undefined.
     */
    PriorityQueue.prototype.enqueue = function (element) {
        return this.heap.add(element);
    };
    /**
     * Inserts the specified element into this priority queue.
     * @param {Object} element the element to insert.
     * @return {boolean} true if the element was inserted, or false if it is undefined.
     */
    PriorityQueue.prototype.add = function (element) {
        return this.heap.add(element);
    };
    /**
     * Retrieves and removes the highest priority element of this queue.
     * @return {*} the the highest priority element of this queue,
     *  or undefined if this queue is empty.
     */
    PriorityQueue.prototype.dequeue = function () {
        if (this.heap.size() !== 0) {
            var el = this.heap.peek();
            this.heap.removeRoot();
            return el;
        }
        return undefined;
    };
    /**
     * Retrieves, but does not remove, the highest priority element of this queue.
     * @return {*} the highest priority element of this queue, or undefined if this queue is empty.
     */
    PriorityQueue.prototype.peek = function () {
        return this.heap.peek();
    };
    /**
     * Returns true if this priority queue contains the specified element.
     * @param {Object} element element to search for.
     * @return {boolean} true if this priority queue contains the specified element,
     * false otherwise.
     */
    PriorityQueue.prototype.contains = function (element) {
        return this.heap.contains(element);
    };
    /**
     * Checks if this priority queue is empty.
     * @return {boolean} true if and only if this priority queue contains no items; false
     * otherwise.
     */
    PriorityQueue.prototype.isEmpty = function () {
        return this.heap.isEmpty();
    };
    /**
     * Returns the number of elements in this priority queue.
     * @return {number} the number of elements in this priority queue.
     */
    PriorityQueue.prototype.size = function () {
        return this.heap.size();
    };
    /**
     * Removes all of the elements from this priority queue.
     */
    PriorityQueue.prototype.clear = function () {
        this.heap.clear();
    };
    /**
     * Executes the provided function once for each element present in this queue in
     * no particular order.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    PriorityQueue.prototype.forEach = function (callback) {
        this.heap.forEach(callback);
    };
    return PriorityQueue;
}()); // end of priority queue
exports.default = PriorityQueue;
//# sourceMappingURL=PriorityQueue.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/Queue.js":
/*!***************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/Queue.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var LinkedList_1 = __webpack_require__(/*! ./LinkedList */ "./node_modules/typescript-collections/dist/lib/LinkedList.js");
var Queue = /** @class */ (function () {
    /**
     * Creates an empty queue.
     * @class A queue is a First-In-First-Out (FIFO) data structure, the first
     * element added to the queue will be the first one to be removed. This
     * implementation uses a linked list as a container.
     * @constructor
     */
    function Queue() {
        this.list = new LinkedList_1.default();
    }
    /**
     * Inserts the specified element into the end of this queue.
     * @param {Object} elem the element to insert.
     * @return {boolean} true if the element was inserted, or false if it is undefined.
     */
    Queue.prototype.enqueue = function (elem) {
        return this.list.add(elem);
    };
    /**
     * Inserts the specified element into the end of this queue.
     * @param {Object} elem the element to insert.
     * @return {boolean} true if the element was inserted, or false if it is undefined.
     */
    Queue.prototype.add = function (elem) {
        return this.list.add(elem);
    };
    /**
     * Retrieves and removes the head of this queue.
     * @return {*} the head of this queue, or undefined if this queue is empty.
     */
    Queue.prototype.dequeue = function () {
        if (this.list.size() !== 0) {
            var el = this.list.first();
            this.list.removeElementAtIndex(0);
            return el;
        }
        return undefined;
    };
    /**
     * Retrieves, but does not remove, the head of this queue.
     * @return {*} the head of this queue, or undefined if this queue is empty.
     */
    Queue.prototype.peek = function () {
        if (this.list.size() !== 0) {
            return this.list.first();
        }
        return undefined;
    };
    /**
     * Returns the number of elements in this queue.
     * @return {number} the number of elements in this queue.
     */
    Queue.prototype.size = function () {
        return this.list.size();
    };
    /**
     * Returns true if this queue contains the specified element.
     * <p>If the elements inside this stack are
     * not comparable with the === operator, a custom equals function should be
     * provided to perform searches, the function must receive two arguments and
     * return true if they are equal, false otherwise. Example:</p>
     *
     * <pre>
     * const petsAreEqualByName (pet1, pet2) {
     *  return pet1.name === pet2.name;
     * }
     * </pre>
     * @param {Object} elem element to search for.
     * @param {function(Object,Object):boolean=} equalsFunction optional
     * function to check if two elements are equal.
     * @return {boolean} true if this queue contains the specified element,
     * false otherwise.
     */
    Queue.prototype.contains = function (elem, equalsFunction) {
        return this.list.contains(elem, equalsFunction);
    };
    /**
     * Checks if this queue is empty.
     * @return {boolean} true if and only if this queue contains no items; false
     * otherwise.
     */
    Queue.prototype.isEmpty = function () {
        return this.list.size() <= 0;
    };
    /**
     * Removes all of the elements from this queue.
     */
    Queue.prototype.clear = function () {
        this.list.clear();
    };
    /**
     * Executes the provided function once for each element present in this queue in
     * FIFO order.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    Queue.prototype.forEach = function (callback) {
        this.list.forEach(callback);
    };
    return Queue;
}()); // End of queue
exports.default = Queue;
//# sourceMappingURL=Queue.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/Set.js":
/*!*************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/Set.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var util = __webpack_require__(/*! ./util */ "./node_modules/typescript-collections/dist/lib/util.js");
var arrays = __webpack_require__(/*! ./arrays */ "./node_modules/typescript-collections/dist/lib/arrays.js");
var Dictionary_1 = __webpack_require__(/*! ./Dictionary */ "./node_modules/typescript-collections/dist/lib/Dictionary.js");
var Set = /** @class */ (function () {
    /**
     * Creates an empty set.
     * @class <p>A set is a data structure that contains no duplicate items.</p>
     * <p>If the inserted elements are custom objects a function
     * which converts elements to strings must be provided. Example:</p>
     *
     * <pre>
     * function petToString(pet) {
     *  return pet.name;
     * }
     * </pre>
     *
     * @constructor
     * @param {function(Object):string=} toStringFunction optional function used
     * to convert elements to strings. If the elements aren't strings or if toString()
     * is not appropriate, a custom function which receives an object and returns a
     * unique string must be provided.
     */
    function Set(toStringFunction) {
        this.dictionary = new Dictionary_1.default(toStringFunction);
    }
    /**
     * Returns true if this set contains the specified element.
     * @param {Object} element element to search for.
     * @return {boolean} true if this set contains the specified element,
     * false otherwise.
     */
    Set.prototype.contains = function (element) {
        return this.dictionary.containsKey(element);
    };
    /**
     * Adds the specified element to this set if it is not already present.
     * @param {Object} element the element to insert.
     * @return {boolean} true if this set did not already contain the specified element.
     */
    Set.prototype.add = function (element) {
        if (this.contains(element) || util.isUndefined(element)) {
            return false;
        }
        else {
            this.dictionary.setValue(element, element);
            return true;
        }
    };
    /**
     * Performs an intersection between this and another set.
     * Removes all values that are not present this set and the given set.
     * @param {collections.Set} otherSet other set.
     */
    Set.prototype.intersection = function (otherSet) {
        var set = this;
        this.forEach(function (element) {
            if (!otherSet.contains(element)) {
                set.remove(element);
            }
            return true;
        });
    };
    /**
     * Performs a union between this and another set.
     * Adds all values from the given set to this set.
     * @param {collections.Set} otherSet other set.
     */
    Set.prototype.union = function (otherSet) {
        var set = this;
        otherSet.forEach(function (element) {
            set.add(element);
            return true;
        });
    };
    /**
     * Performs a difference between this and another set.
     * Removes from this set all the values that are present in the given set.
     * @param {collections.Set} otherSet other set.
     */
    Set.prototype.difference = function (otherSet) {
        var set = this;
        otherSet.forEach(function (element) {
            set.remove(element);
            return true;
        });
    };
    /**
     * Checks whether the given set contains all the elements in this set.
     * @param {collections.Set} otherSet other set.
     * @return {boolean} true if this set is a subset of the given set.
     */
    Set.prototype.isSubsetOf = function (otherSet) {
        if (this.size() > otherSet.size()) {
            return false;
        }
        var isSub = true;
        this.forEach(function (element) {
            if (!otherSet.contains(element)) {
                isSub = false;
                return false;
            }
            return true;
        });
        return isSub;
    };
    /**
     * Removes the specified element from this set if it is present.
     * @return {boolean} true if this set contained the specified element.
     */
    Set.prototype.remove = function (element) {
        if (!this.contains(element)) {
            return false;
        }
        else {
            this.dictionary.remove(element);
            return true;
        }
    };
    /**
     * Executes the provided function once for each element
     * present in this set.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one arguments: the element. To break the iteration you can
     * optionally return false.
     */
    Set.prototype.forEach = function (callback) {
        this.dictionary.forEach(function (k, v) {
            return callback(v);
        });
    };
    /**
     * Returns an array containing all of the elements in this set in arbitrary order.
     * @return {Array} an array containing all of the elements in this set.
     */
    Set.prototype.toArray = function () {
        return this.dictionary.values();
    };
    /**
     * Returns true if this set contains no elements.
     * @return {boolean} true if this set contains no elements.
     */
    Set.prototype.isEmpty = function () {
        return this.dictionary.isEmpty();
    };
    /**
     * Returns the number of elements in this set.
     * @return {number} the number of elements in this set.
     */
    Set.prototype.size = function () {
        return this.dictionary.size();
    };
    /**
     * Removes all of the elements from this set.
     */
    Set.prototype.clear = function () {
        this.dictionary.clear();
    };
    /*
    * Provides a string representation for display
    */
    Set.prototype.toString = function () {
        return arrays.toString(this.toArray());
    };
    return Set;
}()); // end of Set
exports.default = Set;
//# sourceMappingURL=Set.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/Stack.js":
/*!***************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/Stack.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var LinkedList_1 = __webpack_require__(/*! ./LinkedList */ "./node_modules/typescript-collections/dist/lib/LinkedList.js");
var Stack = /** @class */ (function () {
    /**
     * Creates an empty Stack.
     * @class A Stack is a Last-In-First-Out (LIFO) data structure, the last
     * element added to the stack will be the first one to be removed. This
     * implementation uses a linked list as a container.
     * @constructor
     */
    function Stack() {
        this.list = new LinkedList_1.default();
    }
    /**
     * Pushes an item onto the top of this stack.
     * @param {Object} elem the element to be pushed onto this stack.
     * @return {boolean} true if the element was pushed or false if it is undefined.
     */
    Stack.prototype.push = function (elem) {
        return this.list.add(elem, 0);
    };
    /**
     * Pushes an item onto the top of this stack.
     * @param {Object} elem the element to be pushed onto this stack.
     * @return {boolean} true if the element was pushed or false if it is undefined.
     */
    Stack.prototype.add = function (elem) {
        return this.list.add(elem, 0);
    };
    /**
     * Removes the object at the top of this stack and returns that object.
     * @return {*} the object at the top of this stack or undefined if the
     * stack is empty.
     */
    Stack.prototype.pop = function () {
        return this.list.removeElementAtIndex(0);
    };
    /**
     * Looks at the object at the top of this stack without removing it from the
     * stack.
     * @return {*} the object at the top of this stack or undefined if the
     * stack is empty.
     */
    Stack.prototype.peek = function () {
        return this.list.first();
    };
    /**
     * Returns the number of elements in this stack.
     * @return {number} the number of elements in this stack.
     */
    Stack.prototype.size = function () {
        return this.list.size();
    };
    /**
     * Returns true if this stack contains the specified element.
     * <p>If the elements inside this stack are
     * not comparable with the === operator, a custom equals function should be
     * provided to perform searches, the function must receive two arguments and
     * return true if they are equal, false otherwise. Example:</p>
     *
     * <pre>
     * const petsAreEqualByName (pet1, pet2) {
     *  return pet1.name === pet2.name;
     * }
     * </pre>
     * @param {Object} elem element to search for.
     * @param {function(Object,Object):boolean=} equalsFunction optional
     * function to check if two elements are equal.
     * @return {boolean} true if this stack contains the specified element,
     * false otherwise.
     */
    Stack.prototype.contains = function (elem, equalsFunction) {
        return this.list.contains(elem, equalsFunction);
    };
    /**
     * Checks if this stack is empty.
     * @return {boolean} true if and only if this stack contains no items; false
     * otherwise.
     */
    Stack.prototype.isEmpty = function () {
        return this.list.isEmpty();
    };
    /**
     * Removes all of the elements from this stack.
     */
    Stack.prototype.clear = function () {
        this.list.clear();
    };
    /**
     * Executes the provided function once for each element present in this stack in
     * LIFO order.
     * @param {function(Object):*} callback function to execute, it is
     * invoked with one argument: the element value, to break the iteration you can
     * optionally return false.
     */
    Stack.prototype.forEach = function (callback) {
        this.list.forEach(callback);
    };
    return Stack;
}()); // End of stack
exports.default = Stack;
//# sourceMappingURL=Stack.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/arrays.js":
/*!****************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/arrays.js ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var util = __webpack_require__(/*! ./util */ "./node_modules/typescript-collections/dist/lib/util.js");
/**
 * Returns the position of the first occurrence of the specified item
 * within the specified array.4
 * @param {*} array the array in which to search the element.
 * @param {Object} item the element to search.
 * @param {function(Object,Object):boolean=} equalsFunction optional function used to
 * check equality between 2 elements.
 * @return {number} the position of the first occurrence of the specified element
 * within the specified array, or -1 if not found.
 */
function indexOf(array, item, equalsFunction) {
    var equals = equalsFunction || util.defaultEquals;
    var length = array.length;
    for (var i = 0; i < length; i++) {
        if (equals(array[i], item)) {
            return i;
        }
    }
    return -1;
}
exports.indexOf = indexOf;
/**
 * Returns the position of the last occurrence of the specified element
 * within the specified array.
 * @param {*} array the array in which to search the element.
 * @param {Object} item the element to search.
 * @param {function(Object,Object):boolean=} equalsFunction optional function used to
 * check equality between 2 elements.
 * @return {number} the position of the last occurrence of the specified element
 * within the specified array or -1 if not found.
 */
function lastIndexOf(array, item, equalsFunction) {
    var equals = equalsFunction || util.defaultEquals;
    var length = array.length;
    for (var i = length - 1; i >= 0; i--) {
        if (equals(array[i], item)) {
            return i;
        }
    }
    return -1;
}
exports.lastIndexOf = lastIndexOf;
/**
 * Returns true if the specified array contains the specified element.
 * @param {*} array the array in which to search the element.
 * @param {Object} item the element to search.
 * @param {function(Object,Object):boolean=} equalsFunction optional function to
 * check equality between 2 elements.
 * @return {boolean} true if the specified array contains the specified element.
 */
function contains(array, item, equalsFunction) {
    return indexOf(array, item, equalsFunction) >= 0;
}
exports.contains = contains;
/**
 * Removes the first ocurrence of the specified element from the specified array.
 * @param {*} array the array in which to search element.
 * @param {Object} item the element to search.
 * @param {function(Object,Object):boolean=} equalsFunction optional function to
 * check equality between 2 elements.
 * @return {boolean} true if the array changed after this call.
 */
function remove(array, item, equalsFunction) {
    var index = indexOf(array, item, equalsFunction);
    if (index < 0) {
        return false;
    }
    array.splice(index, 1);
    return true;
}
exports.remove = remove;
/**
 * Returns the number of elements in the specified array equal
 * to the specified object.
 * @param {Array} array the array in which to determine the frequency of the element.
 * @param {Object} item the element whose frequency is to be determined.
 * @param {function(Object,Object):boolean=} equalsFunction optional function used to
 * check equality between 2 elements.
 * @return {number} the number of elements in the specified array
 * equal to the specified object.
 */
function frequency(array, item, equalsFunction) {
    var equals = equalsFunction || util.defaultEquals;
    var length = array.length;
    var freq = 0;
    for (var i = 0; i < length; i++) {
        if (equals(array[i], item)) {
            freq++;
        }
    }
    return freq;
}
exports.frequency = frequency;
/**
 * Returns true if the two specified arrays are equal to one another.
 * Two arrays are considered equal if both arrays contain the same number
 * of elements, and all corresponding pairs of elements in the two
 * arrays are equal and are in the same order.
 * @param {Array} array1 one array to be tested for equality.
 * @param {Array} array2 the other array to be tested for equality.
 * @param {function(Object,Object):boolean=} equalsFunction optional function used to
 * check equality between elemements in the arrays.
 * @return {boolean} true if the two arrays are equal
 */
function equals(array1, array2, equalsFunction) {
    var equals = equalsFunction || util.defaultEquals;
    if (array1.length !== array2.length) {
        return false;
    }
    var length = array1.length;
    for (var i = 0; i < length; i++) {
        if (!equals(array1[i], array2[i])) {
            return false;
        }
    }
    return true;
}
exports.equals = equals;
/**
 * Returns shallow a copy of the specified array.
 * @param {*} array the array to copy.
 * @return {Array} a copy of the specified array
 */
function copy(array) {
    return array.concat();
}
exports.copy = copy;
/**
 * Swaps the elements at the specified positions in the specified array.
 * @param {Array} array The array in which to swap elements.
 * @param {number} i the index of one element to be swapped.
 * @param {number} j the index of the other element to be swapped.
 * @return {boolean} true if the array is defined and the indexes are valid.
 */
function swap(array, i, j) {
    if (i < 0 || i >= array.length || j < 0 || j >= array.length) {
        return false;
    }
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
    return true;
}
exports.swap = swap;
function toString(array) {
    return '[' + array.toString() + ']';
}
exports.toString = toString;
/**
 * Executes the provided function once for each element present in this array
 * starting from index 0 to length - 1.
 * @param {Array} array The array in which to iterate.
 * @param {function(Object):*} callback function to execute, it is
 * invoked with one argument: the element value, to break the iteration you can
 * optionally return false.
 */
function forEach(array, callback) {
    for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
        var ele = array_1[_i];
        if (callback(ele) === false) {
            return;
        }
    }
}
exports.forEach = forEach;
//# sourceMappingURL=arrays.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/index.js":
/*!***************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/index.js ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Copyright 2013 Basarat Ali Syed. All Rights Reserved.
//
// Licensed under MIT open source license http://opensource.org/licenses/MIT
//
// Orginal javascript code was by Mauricio Santos
//
var _arrays = __webpack_require__(/*! ./arrays */ "./node_modules/typescript-collections/dist/lib/arrays.js");
exports.arrays = _arrays;
var Bag_1 = __webpack_require__(/*! ./Bag */ "./node_modules/typescript-collections/dist/lib/Bag.js");
exports.Bag = Bag_1.default;
var BSTree_1 = __webpack_require__(/*! ./BSTree */ "./node_modules/typescript-collections/dist/lib/BSTree.js");
exports.BSTree = BSTree_1.default;
var BSTreeKV_1 = __webpack_require__(/*! ./BSTreeKV */ "./node_modules/typescript-collections/dist/lib/BSTreeKV.js");
exports.BSTreeKV = BSTreeKV_1.default;
var Dictionary_1 = __webpack_require__(/*! ./Dictionary */ "./node_modules/typescript-collections/dist/lib/Dictionary.js");
exports.Dictionary = Dictionary_1.default;
var Heap_1 = __webpack_require__(/*! ./Heap */ "./node_modules/typescript-collections/dist/lib/Heap.js");
exports.Heap = Heap_1.default;
var LinkedDictionary_1 = __webpack_require__(/*! ./LinkedDictionary */ "./node_modules/typescript-collections/dist/lib/LinkedDictionary.js");
exports.LinkedDictionary = LinkedDictionary_1.default;
var LinkedList_1 = __webpack_require__(/*! ./LinkedList */ "./node_modules/typescript-collections/dist/lib/LinkedList.js");
exports.LinkedList = LinkedList_1.default;
var MultiDictionary_1 = __webpack_require__(/*! ./MultiDictionary */ "./node_modules/typescript-collections/dist/lib/MultiDictionary.js");
exports.MultiDictionary = MultiDictionary_1.default;
var FactoryDictionary_1 = __webpack_require__(/*! ./FactoryDictionary */ "./node_modules/typescript-collections/dist/lib/FactoryDictionary.js");
exports.FactoryDictionary = FactoryDictionary_1.default;
var FactoryDictionary_2 = __webpack_require__(/*! ./FactoryDictionary */ "./node_modules/typescript-collections/dist/lib/FactoryDictionary.js");
exports.DefaultDictionary = FactoryDictionary_2.default;
var Queue_1 = __webpack_require__(/*! ./Queue */ "./node_modules/typescript-collections/dist/lib/Queue.js");
exports.Queue = Queue_1.default;
var PriorityQueue_1 = __webpack_require__(/*! ./PriorityQueue */ "./node_modules/typescript-collections/dist/lib/PriorityQueue.js");
exports.PriorityQueue = PriorityQueue_1.default;
var Set_1 = __webpack_require__(/*! ./Set */ "./node_modules/typescript-collections/dist/lib/Set.js");
exports.Set = Set_1.default;
var Stack_1 = __webpack_require__(/*! ./Stack */ "./node_modules/typescript-collections/dist/lib/Stack.js");
exports.Stack = Stack_1.default;
var MultiRootTree_1 = __webpack_require__(/*! ./MultiRootTree */ "./node_modules/typescript-collections/dist/lib/MultiRootTree.js");
exports.MultiRootTree = MultiRootTree_1.default;
var _util = __webpack_require__(/*! ./util */ "./node_modules/typescript-collections/dist/lib/util.js");
exports.util = _util;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/typescript-collections/dist/lib/util.js":
/*!**************************************************************!*\
  !*** ./node_modules/typescript-collections/dist/lib/util.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var _hasOwnProperty = Object.prototype.hasOwnProperty;
exports.has = function (obj, prop) {
    return _hasOwnProperty.call(obj, prop);
};
/**
 * Default function to compare element order.
 * @function
 */
function defaultCompare(a, b) {
    if (a < b) {
        return -1;
    }
    else if (a === b) {
        return 0;
    }
    else {
        return 1;
    }
}
exports.defaultCompare = defaultCompare;
/**
 * Default function to test equality.
 * @function
 */
function defaultEquals(a, b) {
    return a === b;
}
exports.defaultEquals = defaultEquals;
/**
 * Default function to convert an object to a string.
 * @function
 */
function defaultToString(item) {
    if (item === null) {
        return 'COLLECTION_NULL';
    }
    else if (isUndefined(item)) {
        return 'COLLECTION_UNDEFINED';
    }
    else if (isString(item)) {
        return '$s' + item;
    }
    else {
        return '$o' + item.toString();
    }
}
exports.defaultToString = defaultToString;
/**
 * Joins all the properies of the object using the provided join string
 */
function makeString(item, join) {
    if (join === void 0) { join = ','; }
    if (item === null) {
        return 'COLLECTION_NULL';
    }
    else if (isUndefined(item)) {
        return 'COLLECTION_UNDEFINED';
    }
    else if (isString(item)) {
        return item.toString();
    }
    else {
        var toret = '{';
        var first = true;
        for (var prop in item) {
            if (exports.has(item, prop)) {
                if (first) {
                    first = false;
                }
                else {
                    toret = toret + join;
                }
                toret = toret + prop + ':' + item[prop];
            }
        }
        return toret + '}';
    }
}
exports.makeString = makeString;
/**
 * Checks if the given argument is a function.
 * @function
 */
function isFunction(func) {
    return (typeof func) === 'function';
}
exports.isFunction = isFunction;
/**
 * Checks if the given argument is undefined.
 * @function
 */
function isUndefined(obj) {
    return (typeof obj) === 'undefined';
}
exports.isUndefined = isUndefined;
/**
 * Checks if the given argument is a string.
 * @function
 */
function isString(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
}
exports.isString = isString;
/**
 * Reverses a compare function.
 * @function
 */
function reverseCompareFunction(compareFunction) {
    if (isUndefined(compareFunction) || !isFunction(compareFunction)) {
        return function (a, b) {
            if (a < b) {
                return 1;
            }
            else if (a === b) {
                return 0;
            }
            else {
                return -1;
            }
        };
    }
    else {
        return function (d, v) {
            return compareFunction(d, v) * -1;
        };
    }
}
exports.reverseCompareFunction = reverseCompareFunction;
/**
 * Returns an equal function given a compare function.
 * @function
 */
function compareToEquals(compareFunction) {
    return function (a, b) {
        return compareFunction(a, b) === 0;
    };
}
exports.compareToEquals = compareToEquals;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ "./src/Device.ts":
/*!***********************!*\
  !*** ./src/Device.ts ***!
  \***********************/
/*! exports provided: Device */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Device", function() { return Device; });
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Logger */ "./src/Logger.ts");

class Device {
    constructor(name) {
        this.name = name;
        this.state = false;
        this.name = name;
    }
    on() {
        this.state = true;
    }
    off() {
        this.state = false;
    }
    toString() {
        return `
            name: ${this.getName()},
            status: ${this.getState()},
            `;
    }
    getName() {
        return this.name;
    }
    getState() {
        return this.state;
    }
    setName(name) {
        if (this.checkNameValidity(name)) {
            this.name = name;
        }
    }
    isDeviceOn() {
        return this.state !== false;
    }
    checkNameValidity(name) {
        name = name.trim();
        const regex = /[\w\d\s]{5,10}/;
        if (!regex.test(name)) {
            _Logger__WEBPACK_IMPORTED_MODULE_0__["log"].error('Name must include more than 5 characters');
            return false;
        }
        return true;
    }
    deleteTimer() {
        clearInterval(this.timer);
    }
}



/***/ }),

/***/ "./src/Logger.ts":
/*!***********************!*\
  !*** ./src/Logger.ts ***!
  \***********************/
/*! exports provided: log */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "log", function() { return log; });
/*
export const Logger = {
  warning: function(text: string): void {
    console.warn(text);
  },
  error: function(text: string): void {
    console.error(text);
  }
};
*/
const Logger = __webpack_require__(/*! logger-nodejs */ "./node_modules/logger-nodejs/src/index.js");
const log = new Logger();



/***/ }),

/***/ "./src/SmartHouse.ts":
/*!***************************!*\
  !*** ./src/SmartHouse.ts ***!
  \***************************/
/*! exports provided: SmartHouse */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SmartHouse", function() { return SmartHouse; });
/* harmony import */ var typescript_collections__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! typescript-collections */ "./node_modules/typescript-collections/dist/lib/index.js");
/* harmony import */ var typescript_collections__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(typescript_collections__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Logger */ "./src/Logger.ts");


class SmartHouse {
    constructor(nameHouse) {
        this.devices = new typescript_collections__WEBPACK_IMPORTED_MODULE_0__["Dictionary"]();
        if (this._checkName(nameHouse)) {
            this.name = nameHouse;
        }
    }
    _checkName(name) {
        name = name.trim();
        const regex = /[\w\d\s]{5,10}/;
        if (!regex.test(name)) {
            _Logger__WEBPACK_IMPORTED_MODULE_1__["log"].warn('Name must include more than 5 characters');
            return false;
        }
        else {
            return true;
        }
    }
    onAll() {
        for (let val of this.devices.values()) {
            val.on();
        }
    }
    offAll() {
        for (let val of this.devices.values()) {
            val.off();
        }
    }
    deleteAllDevices() {
        this.offAll();
        this.devices.clear();
    }
    getDeviceByName(name) {
        if (this.devices.containsKey(name)) {
            return this.devices.getValue(name);
        }
        _Logger__WEBPACK_IMPORTED_MODULE_1__["log"].warn('There is no device with this name');
        return null;
    }
    getAllDevicesByModel(model) {
        let resultDevices = [];
        for (let val of this.devices.values()) {
            if (val instanceof model) {
                resultDevices.push(val);
            }
        }
        return resultDevices;
    }
    deleteDevicesByModel(model) {
        for (let key of this.devices.keys()) {
            if (this.devices.getValue(key) instanceof model) {
                this.devices.remove(key);
            }
        }
    }
    _isNameUnique(name) {
        return !this.devices.containsKey(name);
    }
    getName() {
        return this.name;
    }
    addDevice(obj) {
        if (this._isNameUnique(obj.getName())) {
            this.devices.setValue(obj.getName(), obj);
        }
    }
    deleteDeviceByName(name) {
        this.devices.remove(name);
    }
    getAllDevices() {
        return this.devices;
    }
}


/***/ }),

/***/ "./src/Speaker.ts":
/*!************************!*\
  !*** ./src/Speaker.ts ***!
  \************************/
/*! exports provided: Speaker */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Speaker", function() { return Speaker; });
/* harmony import */ var _Device__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Device */ "./src/Device.ts");
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Logger */ "./src/Logger.ts");


class Speaker extends _Device__WEBPACK_IMPORTED_MODULE_0__["Device"] {
    constructor() {
        super(...arguments);
        this.playbackState = false;
        this.volumeMin = 0;
        this.volumeMax = 10;
        this.currentVolume = 5;
        this.currentTimerValue = 0;
        this.currentTrack = 0;
        this.trackList = [
            {
                name: 'Song 1',
                duration: 8
            },
            {
                name: 'Song 2',
                duration: 10
            },
            {
                name: 'Song 3',
                duration: 5
            },
            {
                name: 'Song 4',
                duration: 13
            },
            {
                name: 'Song 5',
                duration: 10
            }
        ];
    }
    off() {
        if (this.isDeviceOn()) {
            this.togglePlaybackStatus(false);
            this.currentTimerValue = 0;
            this.currentTrack = 0;
            this.currentVolume = 5;
            super.off();
        }
    }
    // log info about current device state
    toString() {
        return `
        ${super.toString()},
        volume: ${this.currentVolume},
        playing: ${this.playbackState ? 'Play' : 'Pause'},
        currentSong: ${Object.keys(this.trackList[this.currentTrack])[0]},
        songDuration: ${Object.keys(this.trackList[this.currentTrack])[1]}s,
        currentTime: ${this.currentTimerValue}s
`;
    }
    // turn device to play/pause modes
    togglePlaybackStatus(status) {
        if (this.isDeviceOn()) {
            if (arguments.length) {
                this.playbackState = status;
            }
            else {
                this.playbackState = !this.playbackState;
            }
            if (this.playbackState) {
                this._startPlaying(this.currentTimerValue);
            }
            else {
                this._stopPlaying();
            }
        }
    }
    _stopPlaying() {
        if (this.isDeviceOn()) {
            this.deleteTimer();
        }
    }
    _startPlaying(playSongFrom) {
        if (this.isDeviceOn() && this._isDeviceInPlayingModeNow()) {
            let count = playSongFrom;
            let tic = function () {
                if (count >= Object.values(this.trackList[this.currentTrack])[1]) {
                    this.nextTrack();
                }
                else {
                    count++;
                    this.currentTimerValue = count;
                }
            };
            this.timer = setInterval(tic.bind(this), 1000);
        }
    }
    getPlayPauseState() {
        return this.playbackState;
    }
    nextTrack() {
        if (this.currentTrack < this.trackList.length - 1) {
            this.currentTrack++;
        }
        else {
            this.currentTrack = 0;
        }
    }
    previousTrack() {
        if (this.currentTrack > 0) {
            this.currentTrack--;
        }
        else {
            this.currentTrack = this.trackList.length - 1;
        }
    }
    rewindForward(time) {
        if (this.currentTimerValue + time <
            Object.values(this.trackList[this.currentTrack])[1]) {
            this._stopPlaying();
            this._startPlaying(this.currentTimerValue + time);
        }
        else {
            this.nextTrack();
        }
    }
    rewindBack(time) {
        this._stopPlaying();
        if (this.currentTimerValue - time > 0) {
            this._startPlaying(this.currentTimerValue - time);
        }
        else {
            this.nextTrack();
        }
    }
    increaseVolume() {
        if (this.isDeviceOn()) {
            if (this.currentVolume < this.volumeMax) {
                this.currentVolume++;
            }
        }
    }
    decreaseVolume() {
        if (this.isDeviceOn()) {
            if (this.currentVolume > this.volumeMin) {
                this.currentVolume--;
            }
        }
    }
    _isDeviceInPlayingModeNow() {
        if (!this.playbackState) {
            _Logger__WEBPACK_IMPORTED_MODULE_1__["log"].warn('Toggle device to playing mode before starting this operation');
            return false;
        }
        return true;
    }
}


/***/ }),

/***/ "./src/iKettle.ts":
/*!************************!*\
  !*** ./src/iKettle.ts ***!
  \************************/
/*! exports provided: iKettle */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "iKettle", function() { return iKettle; });
/* harmony import */ var _Device__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Device */ "./src/Device.ts");
/* harmony import */ var _Logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Logger */ "./src/Logger.ts");


class iKettle extends _Device__WEBPACK_IMPORTED_MODULE_0__["Device"] {
    constructor() {
        super(...arguments);
        this.currentMode = 0;
        this.maxFullness = 1000;
        this.minFullness = 100;
        this.currentFullness = 0;
        this.currentTemperature = 28;
        this.modes = [
            { standard: 100 },
            { tea: 78 },
            { coffee: 85 },
            { porridge: 72 },
            { 'baby food': 70 }
        ];
    }
    off() {
        super.off();
        this.deleteTimer();
        this.currentTemperature = 26;
    }
    toString() {
        return `
           ${super.toString()};
           mode: ${this.getCurrentMode()},
           currentFullness: ${this.getCurrentFullness()}`;
    }
    nextMode() {
        if (this.currentMode === this.modes.length - 1) {
            this.currentMode = 0;
        }
        else {
            this.currentMode++;
        }
    }
    previousMode() {
        if (this.currentMode === 0) {
            this.currentMode = this.modes.length - 1;
        }
        else {
            this.currentMode--;
        }
    }
    getCurrentMode() {
        return Object.keys(this.modes[this.currentMode])[0];
    }
    addWater(value) {
        let newAmountOfWater = this.currentFullness + value;
        if (newAmountOfWater >= this.minFullness &&
            newAmountOfWater <= this.maxFullness) {
            this.currentFullness = newAmountOfWater;
        }
        else if (newAmountOfWater < this.minFullness) {
            _Logger__WEBPACK_IMPORTED_MODULE_1__["log"].warn('Please, add more water');
        }
        else {
            _Logger__WEBPACK_IMPORTED_MODULE_1__["log"].warn('Please, reduce the amount of water');
        }
    }
    getCurrentFullness() {
        return this.currentFullness;
    }
    boilWater() {
        if (this.isDeviceOn() && this.currentFullness) {
            return new Promise(resolve => {
                this.timer = setInterval(() => {
                    if (this.currentTemperature >=
                        Object.values(this.modes[this.currentMode])[0]) {
                        resolve();
                    }
                    else {
                        this.currentTemperature += 2;
                        this.currentFullness--;
                    }
                }, 1000);
            }).then(() => {
                console.log(this.currentTemperature);
                this.off();
            });
        }
    }
}


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _SmartHouse__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SmartHouse */ "./src/SmartHouse.ts");
/* harmony import */ var _iKettle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./iKettle */ "./src/iKettle.ts");
/* harmony import */ var _Speaker__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Speaker */ "./src/Speaker.ts");



window.sh = new _SmartHouse__WEBPACK_IMPORTED_MODULE_0__["SmartHouse"]('Smart House');
window.Speaker = _Speaker__WEBPACK_IMPORTED_MODULE_2__["Speaker"];
window.iKettle = _iKettle__WEBPACK_IMPORTED_MODULE_1__["iKettle"];


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvZ2dlci1ub2RlanMvc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtY29sbGVjdGlvbnMvZGlzdC9saWIvQlNUcmVlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWNvbGxlY3Rpb25zL2Rpc3QvbGliL0JTVHJlZUtWLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWNvbGxlY3Rpb25zL2Rpc3QvbGliL0JhZy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1jb2xsZWN0aW9ucy9kaXN0L2xpYi9EaWN0aW9uYXJ5LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWNvbGxlY3Rpb25zL2Rpc3QvbGliL0ZhY3RvcnlEaWN0aW9uYXJ5LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWNvbGxlY3Rpb25zL2Rpc3QvbGliL0hlYXAuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtY29sbGVjdGlvbnMvZGlzdC9saWIvTGlua2VkRGljdGlvbmFyeS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1jb2xsZWN0aW9ucy9kaXN0L2xpYi9MaW5rZWRMaXN0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWNvbGxlY3Rpb25zL2Rpc3QvbGliL011bHRpRGljdGlvbmFyeS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1jb2xsZWN0aW9ucy9kaXN0L2xpYi9NdWx0aVJvb3RUcmVlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWNvbGxlY3Rpb25zL2Rpc3QvbGliL1ByaW9yaXR5UXVldWUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtY29sbGVjdGlvbnMvZGlzdC9saWIvUXVldWUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3R5cGVzY3JpcHQtY29sbGVjdGlvbnMvZGlzdC9saWIvU2V0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWNvbGxlY3Rpb25zL2Rpc3QvbGliL1N0YWNrLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy90eXBlc2NyaXB0LWNvbGxlY3Rpb25zL2Rpc3QvbGliL2FycmF5cy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1jb2xsZWN0aW9ucy9kaXN0L2xpYi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdHlwZXNjcmlwdC1jb2xsZWN0aW9ucy9kaXN0L2xpYi91dGlsLmpzIiwid2VicGFjazovLy8uL3NyYy9EZXZpY2UudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL0xvZ2dlci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvU21hcnRIb3VzZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvU3BlYWtlci50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaUtldHRsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGQTs7QUFFYTs7QUFFYixzQkFBc0I7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCLGdCQUFnQjtBQUNoQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRCxxQ0FBcUMsRUFBRTtBQUM1Rjs7QUFFQTtBQUNBLDZDQUE2QztBQUM3Qzs7QUFFQTs7QUFFQSxnQ0FBZ0MsNEJBQTRCO0FBQzVELHVCQUF1QixvQkFBb0IsSUFBSSxVQUFVLElBQUksVUFBVSxPQUFPLEtBQUs7O0FBRW5GO0FBQ0E7QUFDQSw0QkFBNEIsOEJBQThCO0FBQzFEOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyxnQ0FBZ0M7QUFDaEUsaUJBQWlCO0FBQ2pCOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0QkFBNEIsS0FBSyxHQUFHLFlBQVk7QUFDaEQsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7OztBQ3pGQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHNCQUFzQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEscUNBQXFDOztBQUVyQztBQUNBO0FBQ0E7O0FBRUEsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixVQUFVOzs7Ozs7Ozs7Ozs7O0FDdkx6QjtBQUNiO0FBQ0E7QUFDQSxVQUFVLGdCQUFnQixzQ0FBc0MsaUJBQWlCLEVBQUU7QUFDbkYseUJBQXlCLHVEQUF1RDtBQUNoRjtBQUNBO0FBQ0EsdUJBQXVCLHNCQUFzQjtBQUM3QztBQUNBO0FBQ0EsQ0FBQztBQUNELDhDQUE4QyxjQUFjO0FBQzVELGlCQUFpQixtQkFBTyxDQUFDLDhFQUFZO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLDhCQUE4QixrQkFBa0IsY0FBYyxHQUFHLDRCQUE0QjtBQUNqRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQSxrQzs7Ozs7Ozs7Ozs7O0FDcENhO0FBQ2IsOENBQThDLGNBQWM7QUFDNUQsV0FBVyxtQkFBTyxDQUFDLHNFQUFRO0FBQzNCLGNBQWMsbUJBQU8sQ0FBQyx3RUFBUztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLGdDQUFnQztBQUMvQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGdCQUFnQixRQUFRO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsUUFBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZ0JBQWdCLFFBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsUUFBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsbUJBQW1CO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsZUFBZSxtQkFBbUI7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1CQUFtQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxtQkFBbUI7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsRUFBRTtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixFQUFFO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1CQUFtQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE1BQU07QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEI7QUFDQSxnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixnQkFBZ0IsT0FBTztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixlQUFlLE9BQU87QUFDdEIsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsRUFBRTtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLEVBQUU7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLEVBQUU7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZ0JBQWdCLFFBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixPQUFPO0FBQ3ZCO0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4Q0FBOEMsZ0JBQWdCLGdCQUFnQixnQkFBZ0I7QUFDOUYsMkNBQTJDLFNBQVMsYUFBYSxTQUFTO0FBQzFFLGlEQUFpRDtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGdDQUFnQztBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLDBCQUEwQjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsZ0NBQWdDO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBLHlDOzs7Ozs7Ozs7Ozs7QUNqYWE7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RCxXQUFXLG1CQUFPLENBQUMsc0VBQVE7QUFDM0IsYUFBYSxtQkFBTyxDQUFDLHNFQUFRO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsZ0NBQWdDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixnQkFBZ0IsUUFBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZ0JBQWdCLFFBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLEVBQUU7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLEVBQUU7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGdCQUFnQixRQUFRO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLFFBQVEsMkRBQTJEO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG1CQUFtQjtBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsSUFBSTtBQUNMO0FBQ0EseUM7Ozs7Ozs7Ozs7OztBQy9HYTtBQUNiLDhDQUE4QyxjQUFjO0FBQzVELG1CQUFtQixtQkFBTyxDQUFDLGtGQUFjO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGdCQUFnQixRQUFRO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixnQkFBZ0IsUUFBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsRUFBRTtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLEVBQUU7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZUFBZSxpQ0FBaUM7QUFDaEQ7QUFDQSxnQkFBZ0IsUUFBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixRQUFRLGtEQUFrRDtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxtQkFBbUI7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLElBQUk7QUFDTDtBQUNBLGlDOzs7Ozs7Ozs7Ozs7QUMzR2E7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RCxXQUFXLG1CQUFPLENBQUMsc0VBQVE7QUFDM0IsYUFBYSxtQkFBTyxDQUFDLDBFQUFVO0FBQy9CLG1CQUFtQixtQkFBTyxDQUFDLGtGQUFjO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLHlCQUF5QjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZ0JBQWdCLFFBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZ0JBQWdCLFFBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLGdCQUFnQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxnQkFBZ0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxnQkFBZ0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLGVBQWUsZ0JBQWdCO0FBQy9CLGdCQUFnQixRQUFRO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixRQUFRO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxtQkFBbUI7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixNQUFNO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixRQUFRO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixPQUFPO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLElBQUk7QUFDTDtBQUNBLCtCOzs7Ozs7Ozs7Ozs7QUN4S2E7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RCxtQkFBbUIsbUJBQU8sQ0FBQyxrRkFBYztBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixnQkFBZ0IsUUFBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZ0JBQWdCLFFBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLEVBQUU7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixFQUFFO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsZUFBZSxpQ0FBaUM7QUFDaEQ7QUFDQSxnQkFBZ0IsUUFBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixRQUFRLGtEQUFrRDtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxtQkFBbUI7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLElBQUk7QUFDTDtBQUNBLGlDOzs7Ozs7Ozs7Ozs7QUN0R2E7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RCxXQUFXLG1CQUFPLENBQUMsc0VBQVE7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsaUNBQWlDO0FBQzVDO0FBQ0EsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsWUFBWTtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsRUFBRTtBQUNiLFdBQVcsT0FBTztBQUNsQixXQUFXLGlDQUFpQztBQUM1QztBQUNBLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLFFBQVE7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsaUNBQWlDO0FBQzVDO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsV0FBVyxPQUFPO0FBQ2xCLFdBQVcsaUNBQWlDO0FBQzVDO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxNQUFNO0FBQ2pCLFdBQVcsT0FBTztBQUNsQixXQUFXLGlDQUFpQztBQUM1QztBQUNBLFlBQVksT0FBTztBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsWUFBWTtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXLE1BQU07QUFDakIsV0FBVyxNQUFNO0FBQ2pCLFdBQVcsaUNBQWlDO0FBQzVDO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFlBQVk7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxFQUFFO0FBQ2IsWUFBWSxNQUFNO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxNQUFNO0FBQ2pCLFdBQVcsT0FBTztBQUNsQixXQUFXLE9BQU87QUFDbEIsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsTUFBTTtBQUNqQixXQUFXLG1CQUFtQjtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxxQkFBcUI7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQzs7Ozs7Ozs7Ozs7O0FDeEthO0FBQ2IsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxtQkFBTyxDQUFDLDBFQUFVO0FBQ2hDO0FBQ0EsWUFBWSxtQkFBTyxDQUFDLG9FQUFPO0FBQzNCO0FBQ0EsZUFBZSxtQkFBTyxDQUFDLDBFQUFVO0FBQ2pDO0FBQ0EsaUJBQWlCLG1CQUFPLENBQUMsOEVBQVk7QUFDckM7QUFDQSxtQkFBbUIsbUJBQU8sQ0FBQyxrRkFBYztBQUN6QztBQUNBLGFBQWEsbUJBQU8sQ0FBQyxzRUFBUTtBQUM3QjtBQUNBLHlCQUF5QixtQkFBTyxDQUFDLDhGQUFvQjtBQUNyRDtBQUNBLG1CQUFtQixtQkFBTyxDQUFDLGtGQUFjO0FBQ3pDO0FBQ0Esd0JBQXdCLG1CQUFPLENBQUMsNEZBQW1CO0FBQ25EO0FBQ0EsMEJBQTBCLG1CQUFPLENBQUMsZ0dBQXFCO0FBQ3ZEO0FBQ0EsMEJBQTBCLG1CQUFPLENBQUMsZ0dBQXFCO0FBQ3ZEO0FBQ0EsY0FBYyxtQkFBTyxDQUFDLHdFQUFTO0FBQy9CO0FBQ0Esc0JBQXNCLG1CQUFPLENBQUMsd0ZBQWlCO0FBQy9DO0FBQ0EsWUFBWSxtQkFBTyxDQUFDLG9FQUFPO0FBQzNCO0FBQ0EsY0FBYyxtQkFBTyxDQUFDLHdFQUFTO0FBQy9CO0FBQ0Esc0JBQXNCLG1CQUFPLENBQUMsd0ZBQWlCO0FBQy9DO0FBQ0EsWUFBWSxtQkFBTyxDQUFDLHNFQUFRO0FBQzVCO0FBQ0EsaUM7Ozs7Ozs7Ozs7OztBQzFDYTtBQUNiLDhDQUE4QyxjQUFjO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixZQUFZO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0M7Ozs7Ozs7Ozs7OztBQzNJQTtBQUFBO0FBQUE7QUFBK0I7QUFFL0IsTUFBZSxNQUFNO0lBR25CLFlBQWdDLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO1FBRmxDLFVBQUssR0FBWSxLQUFLLENBQUM7UUFHM0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztJQUVILEVBQUU7UUFDQSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUNwQixDQUFDO0lBRUQsR0FBRztRQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFDRCxRQUFRO1FBQ04sT0FBTztvQkFDUyxJQUFJLENBQUMsT0FBTyxFQUFFO3NCQUNaLElBQUksQ0FBQyxRQUFRLEVBQUU7YUFDeEIsQ0FBQztJQUNaLENBQUM7SUFFRCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFFRCxRQUFRO1FBQ04sT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBWTtRQUNsQixJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNoQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNsQjtJQUNILENBQUM7SUFFUyxVQUFVO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUM7SUFDOUIsQ0FBQztJQUVTLGlCQUFpQixDQUFDLElBQVk7UUFDdEMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNuQixNQUFNLEtBQUssR0FBVyxnQkFBZ0IsQ0FBQztRQUN2QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNyQiwyQ0FBRyxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ3RELE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFUyxXQUFXO1FBQ25CLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNGO0FBQ2lCOzs7Ozs7Ozs7Ozs7O0FDeERsQjtBQUFBO0FBQUE7Ozs7Ozs7OztFQVNFO0FBQ0YsTUFBTSxNQUFNLEdBQUcsbUJBQU8sQ0FBQyxnRUFBZSxDQUFDLENBQUM7QUFDeEMsTUFBTSxHQUFHLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztBQUNaOzs7Ozs7Ozs7Ozs7O0FDWmI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFzRDtBQU12QjtBQUd4QixNQUFNLFVBQVU7SUFHckIsWUFBWSxTQUFpQjtRQUZuQixZQUFPLEdBQUcsSUFBSSxpRUFBc0IsRUFBYSxDQUFDO1FBRzFELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM5QixJQUFJLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztTQUN2QjtJQUNILENBQUM7SUFFTyxVQUFVLENBQUMsSUFBWTtRQUM3QixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25CLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3JCLDJDQUFHLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDckQsT0FBTyxLQUFLLENBQUM7U0FDZDthQUFNO1lBQ0wsT0FBTyxJQUFJLENBQUM7U0FDYjtJQUNILENBQUM7SUFDRCxLQUFLO1FBQ0gsS0FBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ3JDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztTQUNWO0lBQ0gsQ0FBQztJQUNELE1BQU07UUFDSixLQUFLLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDckMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ1g7SUFDSCxDQUFDO0lBRUQsZ0JBQWdCO1FBQ2QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQsZUFBZSxDQUFDLElBQVk7UUFDMUIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNsQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3BDO1FBQ0QsMkNBQUcsQ0FBQyxJQUFJLENBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUM5QyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxvQkFBb0IsQ0FBQyxLQUFlO1FBQ2xDLElBQUksYUFBYSxHQUFhLEVBQUUsQ0FBQztRQUNqQyxLQUFLLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUU7WUFDckMsSUFBSSxHQUFHLFlBQVksS0FBSyxFQUFFO2dCQUN4QixhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ3pCO1NBQ0Y7UUFDRCxPQUFPLGFBQWEsQ0FBQztJQUN2QixDQUFDO0lBRUQsb0JBQW9CLENBQUMsS0FBZTtRQUNsQyxLQUFLLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDbkMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWSxLQUFLLEVBQUU7Z0JBQy9DLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQzFCO1NBQ0Y7SUFDSCxDQUFDO0lBRU8sYUFBYSxDQUFDLElBQVk7UUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxPQUFPO1FBQ0wsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFFRCxTQUFTLENBQUMsR0FBTTtRQUNkLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRTtZQUNyQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDM0M7SUFDSCxDQUFDO0lBRUQsa0JBQWtCLENBQUMsSUFBWTtRQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBQ0QsYUFBYTtRQUNYLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7QUN6RkQ7QUFBQTtBQUFBO0FBQUE7QUFBa0M7QUFFSDtBQUV4QixNQUFNLE9BQVEsU0FBUSw4Q0FBTTtJQUFuQzs7UUFDWSxrQkFBYSxHQUFZLEtBQUssQ0FBQztRQUMvQixjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBQ3RCLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFDdkIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDMUIsc0JBQWlCLEdBQVcsQ0FBQyxDQUFDO1FBQzlCLGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBQ3pCLGNBQVMsR0FBa0I7WUFDbkM7Z0JBQ0UsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLENBQUM7YUFDWjtZQUNEO2dCQUNFLElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxFQUFFO2FBQ2I7WUFDRDtnQkFDRSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxRQUFRLEVBQUUsQ0FBQzthQUNaO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsUUFBUSxFQUFFLEVBQUU7YUFDYjtZQUNEO2dCQUNFLElBQUksRUFBRSxRQUFRO2dCQUNkLFFBQVEsRUFBRSxFQUFFO2FBQ2I7U0FDRixDQUFDO0lBOEhKLENBQUM7SUE1SEMsR0FBRztRQUNELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3JCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNqQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1lBQ3ZCLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNiO0lBQ0gsQ0FBQztJQUVELHNDQUFzQztJQUN0QyxRQUFRO1FBQ04sT0FBTztVQUNELEtBQUssQ0FBQyxRQUFRLEVBQUU7a0JBQ1IsSUFBSSxDQUFDLGFBQWE7bUJBQ2pCLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTzt1QkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt1QkFDbEQsSUFBSSxDQUFDLGlCQUFpQjtDQUM1QyxDQUFDO0lBQ0EsQ0FBQztJQUVELGtDQUFrQztJQUNsQyxvQkFBb0IsQ0FBQyxNQUFlO1FBQ2xDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3JCLElBQUksU0FBUyxDQUFDLE1BQU0sRUFBRTtnQkFDcEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7YUFDN0I7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7YUFDMUM7WUFDRCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDNUM7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3JCO1NBQ0Y7SUFDSCxDQUFDO0lBRU8sWUFBWTtRQUNsQixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRTtZQUNyQixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDcEI7SUFDSCxDQUFDO0lBRU8sYUFBYSxDQUFDLFlBQW9CO1FBQ3hDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxFQUFFO1lBQ3pELElBQUksS0FBSyxHQUFHLFlBQVksQ0FBQztZQUV6QixJQUFJLEdBQUcsR0FBRztnQkFDUixJQUFJLEtBQUssSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ2hFLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztpQkFDbEI7cUJBQU07b0JBQ0wsS0FBSyxFQUFFLENBQUM7b0JBQ1IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztpQkFDaEM7WUFDSCxDQUFDLENBQUM7WUFFRixJQUFJLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ2hEO0lBQ0gsQ0FBQztJQUNELGlCQUFpQjtRQUNmLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QixDQUFDO0lBRUQsU0FBUztRQUNQLElBQUksSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDakQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ3JCO2FBQU07WUFDTCxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztTQUN2QjtJQUNILENBQUM7SUFFRCxhQUFhO1FBQ1gsSUFBSSxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsRUFBRTtZQUN6QixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDckI7YUFBTTtZQUNMLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1NBQy9DO0lBQ0gsQ0FBQztJQUNELGFBQWEsQ0FBQyxJQUFZO1FBQ3hCLElBQ0UsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUk7WUFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNuRDtZQUNBLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsQ0FBQztTQUNuRDthQUFNO1lBQ0wsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1NBQ2xCO0lBQ0gsQ0FBQztJQUVELFVBQVUsQ0FBQyxJQUFZO1FBQ3JCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQixJQUFJLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxDQUFDO1NBQ25EO2FBQU07WUFDTCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7U0FDbEI7SUFDSCxDQUFDO0lBQ0QsY0FBYztRQUNaLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3JCLElBQUksSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUN2QyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7YUFDdEI7U0FDRjtJQUNILENBQUM7SUFFRCxjQUFjO1FBQ1osSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDckIsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUN0QjtTQUNGO0lBQ0gsQ0FBQztJQUVPLHlCQUF5QjtRQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUN2QiwyQ0FBRyxDQUFDLElBQUksQ0FDTiw4REFBOEQsQ0FDL0QsQ0FBQztZQUNGLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRjs7Ozs7Ozs7Ozs7OztBQzlKRDtBQUFBO0FBQUE7QUFBQTtBQUFrQztBQUVIO0FBRXhCLE1BQU0sT0FBUSxTQUFRLDhDQUFNO0lBQW5DOztRQUNZLGdCQUFXLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLGdCQUFXLEdBQVcsSUFBSSxDQUFDO1FBQzNCLGdCQUFXLEdBQVcsR0FBRyxDQUFDO1FBQzFCLG9CQUFlLEdBQVcsQ0FBQyxDQUFDO1FBQzVCLHVCQUFrQixHQUFXLEVBQUUsQ0FBQztRQUVoQyxVQUFLLEdBQWtCO1lBQy9CLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRTtZQUNqQixFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUU7WUFDWCxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7WUFDZCxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUU7WUFDaEIsRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFO1NBQ3BCLENBQUM7SUF1RUosQ0FBQztJQXRFQyxHQUFHO1FBQ0QsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVELFFBQVE7UUFDTixPQUFPO2FBQ0UsS0FBSyxDQUFDLFFBQVEsRUFBRTttQkFDVixJQUFJLENBQUMsY0FBYyxFQUFFOzhCQUNWLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxFQUFFLENBQUM7SUFDeEQsQ0FBQztJQUNELFFBQVE7UUFDTixJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzlDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO1NBQ3RCO2FBQU07WUFDTCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDcEI7SUFDSCxDQUFDO0lBRUQsWUFBWTtRQUNWLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxDQUFDLEVBQUU7WUFDMUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FDMUM7YUFBTTtZQUNMLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNwQjtJQUNILENBQUM7SUFFRCxjQUFjO1FBQ1osT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELFFBQVEsQ0FBQyxLQUFhO1FBQ3BCLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFDcEQsSUFDRSxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsV0FBVztZQUNwQyxnQkFBZ0IsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUNwQztZQUNBLElBQUksQ0FBQyxlQUFlLEdBQUcsZ0JBQWdCLENBQUM7U0FDekM7YUFBTSxJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDOUMsMkNBQUcsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztTQUNwQzthQUFNO1lBQ0wsMkNBQUcsQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztTQUNoRDtJQUNILENBQUM7SUFFRCxrQkFBa0I7UUFDaEIsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQzlCLENBQUM7SUFFRCxTQUFTO1FBQ1AsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUM3QyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUU7b0JBQzVCLElBQ0UsSUFBSSxDQUFDLGtCQUFrQjt3QkFDdkIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUM5Qzt3QkFDQSxPQUFPLEVBQUUsQ0FBQztxQkFDWDt5QkFBTTt3QkFDTCxJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxDQUFDO3dCQUM3QixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7cUJBQ3hCO2dCQUNILENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNYLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ2IsQ0FBQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7Q0FDRjs7Ozs7Ozs7Ozs7OztBQ3hGRDtBQUFBO0FBQUE7QUFBQTtBQUEwQztBQUlOO0FBQ0E7QUFVcEMsTUFBTSxDQUFDLEVBQUUsR0FBRyxJQUFJLHNEQUFVLENBQVMsYUFBYSxDQUFDLENBQUM7QUFFbEQsTUFBTSxDQUFDLE9BQU8sR0FBRyxnREFBTyxDQUFDO0FBQ3pCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZ0RBQU8sQ0FBQyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIi8qIGVzbGludCBuby1jb25zb2xlOiAwICovXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc3QgREVGQVVMVF9PUFRTID0geyBsb2dNZXRhZGF0YTogdHJ1ZSwgcGx1Z2luczogW10gfTtcbmNvbnN0IExPR19MRVZFTFMgPSB7XG4gICAgJ2RlYnVnJzogMCxcbiAgICAnaW5mbyc6IDEsXG4gICAgJ3dhcm4nOiAyLFxuICAgICdlcnJvcic6IDMsXG4gICAgJ2ZhdGFsJzogNCxcbiAgICAnYWx3YXlzJzogNVxufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbG9nZ2VyIHRoYXQgZXhwb3NlcyB2YXJpb3VzIGxvZ2dpbmcgZnVuY3Rpb25zIGJhc2VkIG9uIHRoZSBzZWxlY3RlZCBsb2cgbGV2ZWwuXG4gKiBUaGUgc2VsZWN0ZWQgbG9nIGxldmVsIGFjdHMgYXMgYSBmaWx0ZXIgd2l0aCByZWdhcmRzIHRvIGhvdyBtdWNoIHlvdSB3YW50IHByaW50ZWQgb3V0LlxuICogSWYgeW91IGNob29zZSAnaW5mbycgYXMgeW91ciBsb2cgbGV2ZWwgdGhlbiBldmVyeXRoaW5nIGZyb20gaW5mbyAtIGZhdGFsIHdpbGwgYmUgcHJpbnRlZCBvdXQuXG4gKiBPbiB0aGUgb3RoZXIgaGFuZCBpZiB5b3Ugd2FudCB0byBvbmx5IHByaW50IG91dCB0aGUgbW9zdCBzZXZlcmUgZXJyb3JzIHlvdSBjb3VsZCBzZWxlY3QgJ2Vycm9yJ1xuICogYXMgdGhlIGxvZyBsZXZlbCB3aGljaCB3b3VsZCBjYXVzZSBvbmx5IGVycm9yIGFuZCBmYXRhbCBsb2dzIHRvIGJlIHByaW50ZWQgb3V0LiBUaGVyZSBpcyBhIGZ1bmN0aW9uXG4gKiBhdmFpbGFibGUgZm9yIGV2ZXJ5IGxvZyBsZXZlbCBmcm9tIHRoZSBsZXZlbCBjaG9zZW4gYWxsIHRoZSB3YXkgdG8gdGhlIGhpZ2hlc3QgbGV2ZWwuIEZvciBleGFtcGxlLFxuICogaWYgeW91IHdlcmUgdG8gY2hvb3NlIGBmYXRhbGAgYXMgeW91ciBzZWxlY3RlZCBsb2cgbGV2ZWwgdGhlbiBhbiBpbnN0YW5jZSBvZiB0aGlzIGNsYXNzIHdvdWxkIGhhdmVcbiAqIGEgYGZhdGFsKClgIGZ1bmN0aW9uIGF2YWlsYWJsZSBmb3IgeW91IHRvIHVzZS5cbiAqL1xuY2xhc3MgTG9nZ2VyIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRzID0ge30pIHtcbiAgICAgICAgb3B0cyA9IHsgLi4uREVGQVVMVF9PUFRTLCAuLi5vcHRzIH07XG4gICAgICAgIGNvbnN0IGxvZ0xldmVsID0gcHJvY2Vzcy5lbnZbJ0xPR19MRVZFTCddIHx8ICdpbmZvJztcblxuICAgICAgICAvLyBzdG9yZSB0aGUgbnVtZXJpY2FsIHZhbHVlIG9mIHRoZSBzZWxlY3RlZCBsb2cgbGV2ZWwgc28gd2UgZG9uJ3QgaGF2ZSB0byBsb29rIGl0IHVwIGV2ZXJ5IHRpbWUgd2UgbG9nXG4gICAgICAgIC8vIHNvbWV0aGluZ1xuICAgICAgICB0aGlzLlNFTEVDVEVEX0xFVkVMID0gTE9HX0xFVkVMU1tsb2dMZXZlbC50b0xvd2VyQ2FzZSgpXTtcbiAgICAgICAgdGhpcy5uYW1lID0gb3B0cy5uYW1lO1xuICAgICAgICB0aGlzLnBsdWdpbnMgPSBvcHRzLnBsdWdpbnM7XG4gICAgICAgIHRoaXMub3V0cHV0ID0gY29uc29sZS5sb2c7XG5cblxuICAgICAgICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBmb3IgZWFjaCBsb2cgbGV2ZWwgdGhhdCBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHNlbGVjdGVkIGxvZyBsZXZlbC5cbiAgICAgICAgLy8gRm9yIGV4YW1wbGUsIGlmIHRoZSBzZWxlY3RlZCBsb2cgbGV2ZWwgaXMgYGluZm9gIHRoZW4gd2UgY3JlYXRlIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zOlxuICAgICAgICAvLyAgIGluZm8sIHdhcm4sIGVycm9yIGZhdGFsLlxuICAgICAgICBPYmplY3Qua2V5cyhMT0dfTEVWRUxTKS5mb3JFYWNoKGxvZ0xldmVsID0+IHsgdGhpc1tsb2dMZXZlbF0gPSB0aGlzLmxvZyhsb2dMZXZlbCk7IH0pO1xuICAgIH1cblxuICAgIGxvZyhsZXZlbCkge1xuICAgICAgICByZXR1cm4gYXN5bmMgZnVuY3Rpb24odGV4dCwgb3B0cyA9IHt9KSB7XG4gICAgICAgICAgICBjb25zdCBsZXZlbFZhbHVlID0gTE9HX0xFVkVMU1tsZXZlbF07XG5cbiAgICAgICAgICAgIGlmIChsZXZlbFZhbHVlIDwgdGhpcy5TRUxFQ1RFRF9MRVZFTCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBsZXQgdGltZXN0YW1wID0gYDwke25ldyBEYXRlKCkudG9Mb2NhbGVTdHJpbmcoKX0+YDtcbiAgICAgICAgICAgIHRleHQgPSBgWyR7bGV2ZWwudG9VcHBlckNhc2UoKX1dICR7dGltZXN0YW1wfSAoJHt0aGlzLm5hbWV9KSAtPiAke3RleHR9YDtcblxuICAgICAgICAgICAgLy8gc2VyaWFsaXplIGFuZCBsb2cgbWV0YWRhdGEgaWYgbWV0YWRhdGEgbG9nZ2luZyBpcyB0dXJuZWQgb24uXG4gICAgICAgICAgICBpZiAodGhpcy5sb2dNZXRhZGF0YSAmJiBvcHRzLm1ldGFkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGV4dCArPSBgICR7SlNPTi5zdHJpbmdpZnkob3B0cy5tZXRhZGF0YSl9YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5vdXRwdXQodGV4dCk7XG5cbiAgICAgICAgICAgIC8vIHJ1biBhbGwgYXR0YWNoZWQgcGx1Z2luc1xuICAgICAgICAgICAgZm9yIChsZXQgcGx1Z2luIG9mIHRoaXMucGx1Z2lucykge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHBsdWdpbi5ydW4oeyB0ZXh0LCBsZXZlbCwgbGV2ZWxWYWx1ZSwgb3B0cyB9KTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3V0cHV0KCdwbHVnaW4gZXJyb3I6JywgZSk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0IG5hbWUobmFtZSkge1xuICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgdGhpcy5fbmFtZSA9IGAke25hbWV9LSR7cHJvY2Vzcy5waWR9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX25hbWUgPSBwcm9jZXNzLnBpZDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBuYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0TGV2ZWxWYWx1ZShsZXZlbCkge1xuICAgICAgICByZXR1cm4gTE9HX0xFVkVMU1tsZXZlbF07XG4gICAgfVxufVxuXG4vLyBFeHBvcnQgbG9nZ2VyXG5tb2R1bGUuZXhwb3J0cyA9IExvZ2dlcjtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdOyB9O1xuICAgIHJldHVybiBmdW5jdGlvbiAoZCwgYikge1xuICAgICAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xuICAgICAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xuICAgIH07XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIEJTVHJlZUtWXzEgPSByZXF1aXJlKFwiLi9CU1RyZWVLVlwiKTtcbi8qKlxuICogU3BlY2lhbC1jYXNlIG9mIHRoZSBiaW5hcnkgc2VhcmNoIHRyZWUgaW4gd2hpY2ggdGhlIHNlYXJjaCBrZXkgaXMgZXF1YWwgdG8gdGhlIGVsZW1lbnQgdHlwZS5cbiAqIFRoaXMgZGVmaW5pdGlvbiBpcyBzdWl0YWJsZSB3aGVuIHRoZSBlbGVtZW50IHR5cGUgY2FuIG5vdCBiZSBzcGxpdCBiZXR3ZWVuIHdoYXQgZGVmaW5lcyBpdHMgb3JkZXJcbiAqIGFuZCB3aGF0IGRvZXMgbm90IChlZy4gcHJpbWl0aXZlIHR5cGVzIGFzIG9wcG9zZWQgdG8gaW5kZXhlZCByZWNvcmRzKS5cbiAqXG4gKiBUaGUgdGFibGUgYmVsb3cgc2hvd3Mgc29tZSB1c2UtY2FzZSBleGFtcGxlcyBmb3IgYm90aCBpbnRlcmZhY2VzOlxuICpcbiAqICAgICAgICAgICBlbGVtZW50IHR5cGUgICAgICAgICAgICAgIHwgIG1vc3Qgc3VpdGFibGUgaW50ZXJmYWNlXG4gKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICogICAgbnVtYmVyICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgQlNUcmVlPG51bWJlcj5cbiAqICAgIHN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgIHwgIEJTVHJlZTxzdHJpbmc+XG4gKiB7IG9yZGVyOiBudW1iZXIsIGRhdGE6IHN0cmluZyB9ICAgICB8ICBCU1RyZWVLVjx7b3JkZXI6IG51bWJlcn0sIHtvcmRlcjogbnVtYmVyLCBkYXRhOiBzdHJpbmd9PlxuICpcbiAqIEBzZWUgQlNUcmVlS1ZcbiAqL1xudmFyIEJTVHJlZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoQlNUcmVlLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIEJTVHJlZSgpIHtcbiAgICAgICAgcmV0dXJuIF9zdXBlciAhPT0gbnVsbCAmJiBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gQlNUcmVlO1xufShCU1RyZWVLVl8xLmRlZmF1bHQpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEJTVHJlZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUJTVHJlZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbnZhciBRdWV1ZV8xID0gcmVxdWlyZShcIi4vUXVldWVcIik7XG4vKipcbiAqIEdlbmVyYWwgYmluYXJ5IHNlYXJjaCB0cmVlIGltcGxlbWVudGF0aW9uLlxuICpcbiAqIFRoaXMgaW50ZXJmYWNlIGFsbG93cyBvbmUgdG8gc2VhcmNoIGVsZW1lbnRzIHVzaW5nIGEgc3Vic2V0IG9mIHRoZWlyIGF0dHJpYnV0ZXMgKHRodXMgdGhlXG4gKiB0cmVlIGNhbiBiZSB1c2VkIGFzIGFuIGluZGV4IGZvciBjb21wbGV4IG9iamVjdHMpLlxuICogVGhlIGF0dHJpYnV0ZXMgcmVxdWlyZWQgdG8gZGVmaW5lIGFuIG9yZGVyaW5nIGluIHRoZSB0cmVlIG11c3QgYmUgZGVmaW5lZCBpbiB0aGUgdHlwZSBLLlxuICogQW55IGFkZGl0aW9uYWwgYXR0cmlidXRlIG11c3QgYmUgZGVmaW5lZCBpbiB0aGUgdHlwZSBWLlxuICpcbiAqIEBzZWUgQlNUcmVlXG4gKi9cbnZhciBCU1RyZWVLViA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IGJpbmFyeSBzZWFyY2ggdHJlZS5cbiAgICAgKiBAY2xhc3MgPHA+QSBiaW5hcnkgc2VhcmNoIHRyZWUgaXMgYSBiaW5hcnkgdHJlZSBpbiB3aGljaCBlYWNoXG4gICAgICogaW50ZXJuYWwgbm9kZSBzdG9yZXMgYW4gZWxlbWVudCBzdWNoIHRoYXQgdGhlIGVsZW1lbnRzIHN0b3JlZCBpbiB0aGVcbiAgICAgKiBsZWZ0IHN1YnRyZWUgYXJlIGxlc3MgdGhhbiBpdCBhbmQgdGhlIGVsZW1lbnRzXG4gICAgICogc3RvcmVkIGluIHRoZSByaWdodCBzdWJ0cmVlIGFyZSBncmVhdGVyLjwvcD5cbiAgICAgKiA8cD5Gb3JtYWxseSwgYSBiaW5hcnkgc2VhcmNoIHRyZWUgaXMgYSBub2RlLWJhc2VkIGJpbmFyeSB0cmVlIGRhdGEgc3RydWN0dXJlIHdoaWNoXG4gICAgICogaGFzIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczo8L3A+XG4gICAgICogPHVsPlxuICAgICAqIDxsaT5UaGUgbGVmdCBzdWJ0cmVlIG9mIGEgbm9kZSBjb250YWlucyBvbmx5IG5vZGVzIHdpdGggZWxlbWVudHMgbGVzc1xuICAgICAqIHRoYW4gdGhlIG5vZGUncyBlbGVtZW50PC9saT5cbiAgICAgKiA8bGk+VGhlIHJpZ2h0IHN1YnRyZWUgb2YgYSBub2RlIGNvbnRhaW5zIG9ubHkgbm9kZXMgd2l0aCBlbGVtZW50cyBncmVhdGVyXG4gICAgICogdGhhbiB0aGUgbm9kZSdzIGVsZW1lbnQ8L2xpPlxuICAgICAqIDxsaT5Cb3RoIHRoZSBsZWZ0IGFuZCByaWdodCBzdWJ0cmVlcyBtdXN0IGFsc28gYmUgYmluYXJ5IHNlYXJjaCB0cmVlcy48L2xpPlxuICAgICAqIDwvdWw+XG4gICAgICogPHA+SWYgdGhlIGluc2VydGVkIGVsZW1lbnRzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGNvbXBhcmUgZnVuY3Rpb24gbXVzdFxuICAgICAqIGJlIHByb3ZpZGVkIGF0IGNvbnN0cnVjdGlvbiB0aW1lLCBvdGhlcndpc2UgdGhlIDw9LCA9PT0gYW5kID49IG9wZXJhdG9ycyBhcmVcbiAgICAgKiB1c2VkIHRvIGNvbXBhcmUgZWxlbWVudHMuIEV4YW1wbGU6PC9wPlxuICAgICAqIDxwcmU+XG4gICAgICogZnVuY3Rpb24gY29tcGFyZShhLCBiKSB7XG4gICAgICogIGlmIChhIGlzIGxlc3MgdGhhbiBiIGJ5IHNvbWUgb3JkZXJpbmcgY3JpdGVyaW9uKSB7XG4gICAgICogICAgIHJldHVybiAtMTtcbiAgICAgKiAgfSBpZiAoYSBpcyBncmVhdGVyIHRoYW4gYiBieSB0aGUgb3JkZXJpbmcgY3JpdGVyaW9uKSB7XG4gICAgICogICAgIHJldHVybiAxO1xuICAgICAqICB9XG4gICAgICogIC8vIGEgbXVzdCBiZSBlcXVhbCB0byBiXG4gICAgICogIHJldHVybiAwO1xuICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOm51bWJlcj19IGNvbXBhcmVGdW5jdGlvbiBvcHRpb25hbFxuICAgICAqIGZ1bmN0aW9uIHVzZWQgdG8gY29tcGFyZSB0d28gZWxlbWVudHMuIE11c3QgcmV0dXJuIGEgbmVnYXRpdmUgaW50ZWdlcixcbiAgICAgKiB6ZXJvLCBvciBhIHBvc2l0aXZlIGludGVnZXIgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGxlc3MgdGhhbiwgZXF1YWwgdG8sXG4gICAgICogb3IgZ3JlYXRlciB0aGFuIHRoZSBzZWNvbmQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gQlNUcmVlS1YoY29tcGFyZUZ1bmN0aW9uKSB7XG4gICAgICAgIHRoaXMucm9vdCA9IG51bGw7XG4gICAgICAgIHRoaXMuY29tcGFyZSA9IGNvbXBhcmVGdW5jdGlvbiB8fCB1dGlsLmRlZmF1bHRDb21wYXJlO1xuICAgICAgICB0aGlzLm5FbGVtZW50cyA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIHNwZWNpZmllZCBlbGVtZW50IHRvIHRoaXMgdHJlZSBpZiBpdCBpcyBub3QgYWxyZWFkeSBwcmVzZW50LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IHRoZSBlbGVtZW50IHRvIGluc2VydC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgdHJlZSBkaWQgbm90IGFscmVhZHkgY29udGFpbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGlmICh1dGlsLmlzVW5kZWZpbmVkKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaW5zZXJ0Tm9kZSh0aGlzLmNyZWF0ZU5vZGUoZWxlbWVudCkpICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLm5FbGVtZW50cysrO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIGVsZW1lbnRzIGZyb20gdGhpcyB0cmVlLlxuICAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yb290ID0gbnVsbDtcbiAgICAgICAgdGhpcy5uRWxlbWVudHMgPSAwO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgdHJlZSBjb250YWlucyBubyBlbGVtZW50cy5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgdHJlZSBjb250YWlucyBubyBlbGVtZW50cy5cbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzID09PSAwO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgdHJlZS5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyB0cmVlLlxuICAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uRWxlbWVudHM7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyB0cmVlIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHRyZWUgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LFxuICAgICAqIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBpZiAodXRpbC5pc1VuZGVmaW5lZChlbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnNlYXJjaE5vZGUodGhpcy5yb290LCBlbGVtZW50KSAhPT0gbnVsbDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIExvb2tzIGZvciB0aGUgdmFsdWUgd2l0aCB0aGUgcHJvdmlkZWQgc2VhcmNoIGtleS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBUaGUga2V5IHRvIGxvb2sgZm9yXG4gICAgICogQHJldHVybiB7T2JqZWN0fSBUaGUgdmFsdWUgZm91bmQgb3IgdW5kZWZpbmVkIGlmIGl0IHdhcyBub3QgZm91bmQuXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLnNlYXJjaCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHZhciByZXQgPSB0aGlzLnNlYXJjaE5vZGUodGhpcy5yb290LCBlbGVtZW50KTtcbiAgICAgICAgaWYgKHJldCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0LmVsZW1lbnQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBmcm9tIHRoaXMgdHJlZSBpZiBpdCBpcyBwcmVzZW50LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyB0cmVlIGNvbnRhaW5lZCB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5zZWFyY2hOb2RlKHRoaXMucm9vdCwgZWxlbWVudCk7XG4gICAgICAgIGlmIChub2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZW1vdmVOb2RlKG5vZGUpO1xuICAgICAgICB0aGlzLm5FbGVtZW50cy0tO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgcHJlc2VudCBpbiB0aGlzIHRyZWUgaW5cbiAgICAgKiBpbi1vcmRlci5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXMgaW52b2tlZCB3aXRoIG9uZVxuICAgICAqIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxuICAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5pbm9yZGVyVHJhdmVyc2FsID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuaW5vcmRlclRyYXZlcnNhbEF1eCh0aGlzLnJvb3QsIGNhbGxiYWNrLCB7XG4gICAgICAgICAgICBzdG9wOiBmYWxzZVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgcHJlc2VudCBpbiB0aGlzIHRyZWUgaW4gcHJlLW9yZGVyLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpcyBpbnZva2VkIHdpdGggb25lXG4gICAgICogYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLnByZW9yZGVyVHJhdmVyc2FsID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMucHJlb3JkZXJUcmF2ZXJzYWxBdXgodGhpcy5yb290LCBjYWxsYmFjaywge1xuICAgICAgICAgICAgc3RvcDogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyB0cmVlIGluIHBvc3Qtb3JkZXIuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzIGludm9rZWQgd2l0aCBvbmVcbiAgICAgKiBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhbiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUucG9zdG9yZGVyVHJhdmVyc2FsID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMucG9zdG9yZGVyVHJhdmVyc2FsQXV4KHRoaXMucm9vdCwgY2FsbGJhY2ssIHtcbiAgICAgICAgICAgIHN0b3A6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgdHJlZSBpblxuICAgICAqIGxldmVsLW9yZGVyLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpcyBpbnZva2VkIHdpdGggb25lXG4gICAgICogYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW4gb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLmxldmVsVHJhdmVyc2FsID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMubGV2ZWxUcmF2ZXJzYWxBdXgodGhpcy5yb290LCBjYWxsYmFjayk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBtaW5pbXVtIGVsZW1lbnQgb2YgdGhpcyB0cmVlLlxuICAgICAqIEByZXR1cm4geyp9IHRoZSBtaW5pbXVtIGVsZW1lbnQgb2YgdGhpcyB0cmVlIG9yIHVuZGVmaW5lZCBpZiB0aGlzIHRyZWUgaXNcbiAgICAgKiBpcyBlbXB0eS5cbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUubWluaW11bSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNFbXB0eSgpIHx8IHRoaXMucm9vdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5taW5pbXVtQXV4KHRoaXMucm9vdCkuZWxlbWVudDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG1heGltdW0gZWxlbWVudCBvZiB0aGlzIHRyZWUuXG4gICAgICogQHJldHVybiB7Kn0gdGhlIG1heGltdW0gZWxlbWVudCBvZiB0aGlzIHRyZWUgb3IgdW5kZWZpbmVkIGlmIHRoaXMgdHJlZSBpc1xuICAgICAqIGlzIGVtcHR5LlxuICAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5tYXhpbXVtID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5pc0VtcHR5KCkgfHwgdGhpcy5yb290ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLm1heGltdW1BdXgodGhpcy5yb290KS5lbGVtZW50O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgdHJlZSBpbiBpbm9yZGVyLlxuICAgICAqIEVxdWl2YWxlbnQgdG8gaW5vcmRlclRyYXZlcnNhbC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcbiAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuXG4gICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5pbm9yZGVyVHJhdmVyc2FsKGNhbGxiYWNrKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgdHJlZSBpbiBpbi1vcmRlci5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgdHJlZSBpbiBpbi1vcmRlci5cbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgIHRoaXMuaW5vcmRlclRyYXZlcnNhbChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgYXJyYXkucHVzaChlbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoaXMgdHJlZS5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBoZWlnaHQgb2YgdGhpcyB0cmVlIG9yIC0xIGlmIGlzIGVtcHR5LlxuICAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5oZWlnaHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlaWdodEF1eCh0aGlzLnJvb3QpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUuc2VhcmNoTm9kZSA9IGZ1bmN0aW9uIChub2RlLCBlbGVtZW50KSB7XG4gICAgICAgIHZhciBjbXAgPSAxO1xuICAgICAgICB3aGlsZSAobm9kZSAhPT0gbnVsbCAmJiBjbXAgIT09IDApIHtcbiAgICAgICAgICAgIGNtcCA9IHRoaXMuY29tcGFyZShlbGVtZW50LCBub2RlLmVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcbiAgICAgICAgICAgICAgICBub2RlID0gbm9kZS5sZWZ0Q2g7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjbXAgPiAwKSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUucmlnaHRDaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLnRyYW5zcGxhbnQgPSBmdW5jdGlvbiAobjEsIG4yKSB7XG4gICAgICAgIGlmIChuMS5wYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdCA9IG4yO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG4xID09PSBuMS5wYXJlbnQubGVmdENoKSB7XG4gICAgICAgICAgICBuMS5wYXJlbnQubGVmdENoID0gbjI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBuMS5wYXJlbnQucmlnaHRDaCA9IG4yO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuMiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbjIucGFyZW50ID0gbjEucGFyZW50O1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5yZW1vdmVOb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUubGVmdENoID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zcGxhbnQobm9kZSwgbm9kZS5yaWdodENoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChub2RlLnJpZ2h0Q2ggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNwbGFudChub2RlLCBub2RlLmxlZnRDaCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMubWluaW11bUF1eChub2RlLnJpZ2h0Q2gpO1xuICAgICAgICAgICAgaWYgKHkucGFyZW50ICE9PSBub2RlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc3BsYW50KHksIHkucmlnaHRDaCk7XG4gICAgICAgICAgICAgICAgeS5yaWdodENoID0gbm9kZS5yaWdodENoO1xuICAgICAgICAgICAgICAgIHkucmlnaHRDaC5wYXJlbnQgPSB5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy50cmFuc3BsYW50KG5vZGUsIHkpO1xuICAgICAgICAgICAgeS5sZWZ0Q2ggPSBub2RlLmxlZnRDaDtcbiAgICAgICAgICAgIHkubGVmdENoLnBhcmVudCA9IHk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLmlub3JkZXJUcmF2ZXJzYWxBdXggPSBmdW5jdGlvbiAobm9kZSwgY2FsbGJhY2ssIHNpZ25hbCkge1xuICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCB8fCBzaWduYWwuc3RvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5vcmRlclRyYXZlcnNhbEF1eChub2RlLmxlZnRDaCwgY2FsbGJhY2ssIHNpZ25hbCk7XG4gICAgICAgIGlmIChzaWduYWwuc3RvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNpZ25hbC5zdG9wID0gY2FsbGJhY2sobm9kZS5lbGVtZW50KSA9PT0gZmFsc2U7XG4gICAgICAgIGlmIChzaWduYWwuc3RvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5vcmRlclRyYXZlcnNhbEF1eChub2RlLnJpZ2h0Q2gsIGNhbGxiYWNrLCBzaWduYWwpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUubGV2ZWxUcmF2ZXJzYWxBdXggPSBmdW5jdGlvbiAobm9kZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gbmV3IFF1ZXVlXzEuZGVmYXVsdCgpO1xuICAgICAgICBpZiAobm9kZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcXVldWUuZW5xdWV1ZShub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gcXVldWUuZGVxdWV1ZSgpIHx8IG51bGw7XG4gICAgICAgIHdoaWxlIChub2RlICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayhub2RlLmVsZW1lbnQpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChub2RlLmxlZnRDaCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHF1ZXVlLmVucXVldWUobm9kZS5sZWZ0Q2gpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vZGUucmlnaHRDaCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHF1ZXVlLmVucXVldWUobm9kZS5yaWdodENoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUgPSBxdWV1ZS5kZXF1ZXVlKCkgfHwgbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUucHJlb3JkZXJUcmF2ZXJzYWxBdXggPSBmdW5jdGlvbiAobm9kZSwgY2FsbGJhY2ssIHNpZ25hbCkge1xuICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCB8fCBzaWduYWwuc3RvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNpZ25hbC5zdG9wID0gY2FsbGJhY2sobm9kZS5lbGVtZW50KSA9PT0gZmFsc2U7XG4gICAgICAgIGlmIChzaWduYWwuc3RvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJlb3JkZXJUcmF2ZXJzYWxBdXgobm9kZS5sZWZ0Q2gsIGNhbGxiYWNrLCBzaWduYWwpO1xuICAgICAgICBpZiAoc2lnbmFsLnN0b3ApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByZW9yZGVyVHJhdmVyc2FsQXV4KG5vZGUucmlnaHRDaCwgY2FsbGJhY2ssIHNpZ25hbCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5wb3N0b3JkZXJUcmF2ZXJzYWxBdXggPSBmdW5jdGlvbiAobm9kZSwgY2FsbGJhY2ssIHNpZ25hbCkge1xuICAgICAgICBpZiAobm9kZSA9PT0gbnVsbCB8fCBzaWduYWwuc3RvcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucG9zdG9yZGVyVHJhdmVyc2FsQXV4KG5vZGUubGVmdENoLCBjYWxsYmFjaywgc2lnbmFsKTtcbiAgICAgICAgaWYgKHNpZ25hbC5zdG9wKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wb3N0b3JkZXJUcmF2ZXJzYWxBdXgobm9kZS5yaWdodENoLCBjYWxsYmFjaywgc2lnbmFsKTtcbiAgICAgICAgaWYgKHNpZ25hbC5zdG9wKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2lnbmFsLnN0b3AgPSBjYWxsYmFjayhub2RlLmVsZW1lbnQpID09PSBmYWxzZTtcbiAgICB9O1xuICAgIEJTVHJlZUtWLnByb3RvdHlwZS5taW5pbXVtQXV4ID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgd2hpbGUgKG5vZGUgIT0gbnVsbCAmJiBub2RlLmxlZnRDaCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUubGVmdENoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH07XG4gICAgQlNUcmVlS1YucHJvdG90eXBlLm1heGltdW1BdXggPSBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICB3aGlsZSAobm9kZSAhPSBudWxsICYmIG5vZGUucmlnaHRDaCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGUucmlnaHRDaDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgQlNUcmVlS1YucHJvdG90eXBlLmhlaWdodEF1eCA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIGlmIChub2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KHRoaXMuaGVpZ2h0QXV4KG5vZGUubGVmdENoKSwgdGhpcy5oZWlnaHRBdXgobm9kZS5yaWdodENoKSkgKyAxO1xuICAgIH07XG4gICAgLypcbiAgICAqIEBwcml2YXRlXG4gICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUuaW5zZXJ0Tm9kZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHZhciBwYXJlbnQgPSBudWxsO1xuICAgICAgICB2YXIgcG9zaXRpb24gPSB0aGlzLnJvb3Q7XG4gICAgICAgIHdoaWxlIChwb3NpdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIGNtcCA9IHRoaXMuY29tcGFyZShub2RlLmVsZW1lbnQsIHBvc2l0aW9uLmVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKGNtcCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY21wIDwgMCkge1xuICAgICAgICAgICAgICAgIHBhcmVudCA9IHBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24ubGVmdENoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcGFyZW50ID0gcG9zaXRpb247XG4gICAgICAgICAgICAgICAgcG9zaXRpb24gPSBwb3NpdGlvbi5yaWdodENoO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG5vZGUucGFyZW50ID0gcGFyZW50O1xuICAgICAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICAgICAgICAvLyB0cmVlIGlzIGVtcHR5XG4gICAgICAgICAgICB0aGlzLnJvb3QgPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuY29tcGFyZShub2RlLmVsZW1lbnQsIHBhcmVudC5lbGVtZW50KSA8IDApIHtcbiAgICAgICAgICAgIHBhcmVudC5sZWZ0Q2ggPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcGFyZW50LnJpZ2h0Q2ggPSBub2RlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBCU1RyZWVLVi5wcm90b3R5cGUuY3JlYXRlTm9kZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBlbGVtZW50OiBlbGVtZW50LFxuICAgICAgICAgICAgbGVmdENoOiBudWxsLFxuICAgICAgICAgICAgcmlnaHRDaDogbnVsbCxcbiAgICAgICAgICAgIHBhcmVudDogbnVsbFxuICAgICAgICB9O1xuICAgIH07XG4gICAgcmV0dXJuIEJTVHJlZUtWO1xufSgpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEJTVHJlZUtWO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9QlNUcmVlS1YuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG52YXIgRGljdGlvbmFyeV8xID0gcmVxdWlyZShcIi4vRGljdGlvbmFyeVwiKTtcbnZhciBTZXRfMSA9IHJlcXVpcmUoXCIuL1NldFwiKTtcbnZhciBCYWcgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBlbXB0eSBiYWcuXG4gICAgICogQGNsYXNzIDxwPkEgYmFnIGlzIGEgc3BlY2lhbCBraW5kIG9mIHNldCBpbiB3aGljaCBtZW1iZXJzIGFyZVxuICAgICAqIGFsbG93ZWQgdG8gYXBwZWFyIG1vcmUgdGhhbiBvbmNlLjwvcD5cbiAgICAgKiA8cD5JZiB0aGUgaW5zZXJ0ZWQgZWxlbWVudHMgYXJlIGN1c3RvbSBvYmplY3RzIGEgZnVuY3Rpb25cbiAgICAgKiB3aGljaCBjb252ZXJ0cyBlbGVtZW50cyB0byB1bmlxdWUgc3RyaW5ncyBtdXN0IGJlIHByb3ZpZGVkLiBFeGFtcGxlOjwvcD5cbiAgICAgKlxuICAgICAqIDxwcmU+XG4gICAgICogZnVuY3Rpb24gcGV0VG9TdHJpbmcocGV0KSB7XG4gICAgICogIHJldHVybiBwZXQubmFtZTtcbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICpcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6c3RyaW5nPX0gdG9TdHJGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB1c2VkXG4gICAgICogdG8gY29udmVydCBlbGVtZW50cyB0byBzdHJpbmdzLiBJZiB0aGUgZWxlbWVudHMgYXJlbid0IHN0cmluZ3Mgb3IgaWYgdG9TdHJpbmcoKVxuICAgICAqIGlzIG5vdCBhcHByb3ByaWF0ZSwgYSBjdXN0b20gZnVuY3Rpb24gd2hpY2ggcmVjZWl2ZXMgYW4gb2JqZWN0IGFuZCByZXR1cm5zIGFcbiAgICAgKiB1bmlxdWUgc3RyaW5nIG11c3QgYmUgcHJvdmlkZWQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gQmFnKHRvU3RyRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy50b1N0ckYgPSB0b1N0ckZ1bmN0aW9uIHx8IHV0aWwuZGVmYXVsdFRvU3RyaW5nO1xuICAgICAgICB0aGlzLmRpY3Rpb25hcnkgPSBuZXcgRGljdGlvbmFyeV8xLmRlZmF1bHQodGhpcy50b1N0ckYpO1xuICAgICAgICB0aGlzLm5FbGVtZW50cyA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgbkNvcGllcyBvZiB0aGUgc3BlY2lmaWVkIG9iamVjdCB0byB0aGlzIGJhZy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIGFkZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcj19IG5Db3BpZXMgdGhlIG51bWJlciBvZiBjb3BpZXMgdG8gYWRkLCBpZiB0aGlzIGFyZ3VtZW50IGlzXG4gICAgICogdW5kZWZpbmVkIDEgY29weSBpcyBhZGRlZC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIHVubGVzcyBlbGVtZW50IGlzIHVuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBCYWcucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChlbGVtZW50LCBuQ29waWVzKSB7XG4gICAgICAgIGlmIChuQ29waWVzID09PSB2b2lkIDApIHsgbkNvcGllcyA9IDE7IH1cbiAgICAgICAgaWYgKHV0aWwuaXNVbmRlZmluZWQoZWxlbWVudCkgfHwgbkNvcGllcyA8PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogZWxlbWVudCxcbiAgICAgICAgICAgICAgICBjb3BpZXM6IG5Db3BpZXNcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkuc2V0VmFsdWUoZWxlbWVudCwgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkuZ2V0VmFsdWUoZWxlbWVudCkuY29waWVzICs9IG5Db3BpZXM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uRWxlbWVudHMgKz0gbkNvcGllcztcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDb3VudHMgdGhlIG51bWJlciBvZiBjb3BpZXMgb2YgdGhlIHNwZWNpZmllZCBvYmplY3QgaW4gdGhpcyBiYWcuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgdGhlIG9iamVjdCB0byBzZWFyY2ggZm9yLi5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgY29waWVzIG9mIHRoZSBvYmplY3QsIDAgaWYgbm90IGZvdW5kXG4gICAgICovXG4gICAgQmFnLnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5jb250YWlucyhlbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaWN0aW9uYXJ5LmdldFZhbHVlKGVsZW1lbnQpLmNvcGllcztcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgYmFnIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGJhZyBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQsXG4gICAgICogZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIEJhZy5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaWN0aW9uYXJ5LmNvbnRhaW5zS2V5KGVsZW1lbnQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBuQ29waWVzIG9mIHRoZSBzcGVjaWZpZWQgb2JqZWN0IHRvIHRoaXMgYmFnLlxuICAgICAqIElmIHRoZSBudW1iZXIgb2YgY29waWVzIHRvIHJlbW92ZSBpcyBncmVhdGVyIHRoYW4gdGhlIGFjdHVhbCBudW1iZXJcbiAgICAgKiBvZiBjb3BpZXMgaW4gdGhlIEJhZywgYWxsIGNvcGllcyBhcmUgcmVtb3ZlZC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIHJlbW92ZS5cbiAgICAgKiBAcGFyYW0ge251bWJlcj19IG5Db3BpZXMgdGhlIG51bWJlciBvZiBjb3BpZXMgdG8gcmVtb3ZlLCBpZiB0aGlzIGFyZ3VtZW50IGlzXG4gICAgICogdW5kZWZpbmVkIDEgY29weSBpcyByZW1vdmVkLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgYXQgbGVhc3QgMSBlbGVtZW50IHdhcyByZW1vdmVkLlxuICAgICAqL1xuICAgIEJhZy5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gKGVsZW1lbnQsIG5Db3BpZXMpIHtcbiAgICAgICAgaWYgKG5Db3BpZXMgPT09IHZvaWQgMCkgeyBuQ29waWVzID0gMTsgfVxuICAgICAgICBpZiAodXRpbC5pc1VuZGVmaW5lZChlbGVtZW50KSB8fCBuQ29waWVzIDw9IDApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuY29udGFpbnMoZWxlbWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5kaWN0aW9uYXJ5LmdldFZhbHVlKGVsZW1lbnQpO1xuICAgICAgICAgICAgaWYgKG5Db3BpZXMgPiBub2RlLmNvcGllcykge1xuICAgICAgICAgICAgICAgIHRoaXMubkVsZW1lbnRzIC09IG5vZGUuY29waWVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMgLT0gbkNvcGllcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUuY29waWVzIC09IG5Db3BpZXM7XG4gICAgICAgICAgICBpZiAobm9kZS5jb3BpZXMgPD0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGljdGlvbmFyeS5yZW1vdmUoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgZWxlbWVudHMgaW4gdGhpcyBiaWcgaW4gYXJiaXRyYXJ5IG9yZGVyLFxuICAgICAqIGluY2x1ZGluZyBtdWx0aXBsZSBjb3BpZXMuXG4gICAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBlbGVtZW50cyBpbiB0aGlzIGJhZy5cbiAgICAgKi9cbiAgICBCYWcucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhID0gW107XG4gICAgICAgIHZhciB2YWx1ZXMgPSB0aGlzLmRpY3Rpb25hcnkudmFsdWVzKCk7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgdmFsdWVzXzEgPSB2YWx1ZXM7IF9pIDwgdmFsdWVzXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHZhbHVlc18xW19pXTtcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gbm9kZS52YWx1ZTtcbiAgICAgICAgICAgIHZhciBjb3BpZXMgPSBub2RlLmNvcGllcztcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29waWVzOyBqKyspIHtcbiAgICAgICAgICAgICAgICBhLnB1c2goZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc2V0IG9mIHVuaXF1ZSBlbGVtZW50cyBpbiB0aGlzIGJhZy5cbiAgICAgKiBAcmV0dXJuIHtjb2xsZWN0aW9ucy5TZXQ8VD59IGEgc2V0IG9mIHVuaXF1ZSBlbGVtZW50cyBpbiB0aGlzIGJhZy5cbiAgICAgKi9cbiAgICBCYWcucHJvdG90eXBlLnRvU2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdG9yZXQgPSBuZXcgU2V0XzEuZGVmYXVsdCh0aGlzLnRvU3RyRik7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IHRoaXMuZGljdGlvbmFyeS52YWx1ZXMoKTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBlbGVtZW50c18xID0gZWxlbWVudHM7IF9pIDwgZWxlbWVudHNfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBlbGUgPSBlbGVtZW50c18xW19pXTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGVsZS52YWx1ZTtcbiAgICAgICAgICAgIHRvcmV0LmFkZCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvcmV0O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudFxuICAgICAqIHByZXNlbnQgaW4gdGhpcyBiYWcsIGluY2x1ZGluZyBtdWx0aXBsZSBjb3BpZXMuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzXG4gICAgICogaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudDogdGhlIGVsZW1lbnQuIFRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhblxuICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxuICAgICAqL1xuICAgIEJhZy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmRpY3Rpb25hcnkuZm9yRWFjaChmdW5jdGlvbiAoaywgdikge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdi52YWx1ZTtcbiAgICAgICAgICAgIHZhciBjb3BpZXMgPSB2LmNvcGllcztcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29waWVzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2sodmFsdWUpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgYmFnLlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIGJhZy5cbiAgICAgKi9cbiAgICBCYWcucHJvdG90eXBlLnNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5FbGVtZW50cztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGJhZyBjb250YWlucyBubyBlbGVtZW50cy5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgYmFnIGNvbnRhaW5zIG5vIGVsZW1lbnRzLlxuICAgICAqL1xuICAgIEJhZy5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzID09PSAwO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgb2YgdGhlIGVsZW1lbnRzIGZyb20gdGhpcyBiYWcuXG4gICAgICovXG4gICAgQmFnLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5uRWxlbWVudHMgPSAwO1xuICAgICAgICB0aGlzLmRpY3Rpb25hcnkuY2xlYXIoKTtcbiAgICB9O1xuICAgIHJldHVybiBCYWc7XG59KCkpOyAvLyBFbmQgb2YgYmFnXG5leHBvcnRzLmRlZmF1bHQgPSBCYWc7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1CYWcuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG52YXIgRGljdGlvbmFyeSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IGRpY3Rpb25hcnkuXG4gICAgICogQGNsYXNzIDxwPkRpY3Rpb25hcmllcyBtYXAga2V5cyB0byB2YWx1ZXM7IGVhY2gga2V5IGNhbiBtYXAgdG8gYXQgbW9zdCBvbmUgdmFsdWUuXG4gICAgICogVGhpcyBpbXBsZW1lbnRhdGlvbiBhY2NlcHRzIGFueSBraW5kIG9mIG9iamVjdHMgYXMga2V5cy48L3A+XG4gICAgICpcbiAgICAgKiA8cD5JZiB0aGUga2V5cyBhcmUgY3VzdG9tIG9iamVjdHMgYSBmdW5jdGlvbiB3aGljaCBjb252ZXJ0cyBrZXlzIHRvIHVuaXF1ZVxuICAgICAqIHN0cmluZ3MgbXVzdCBiZSBwcm92aWRlZC4gRXhhbXBsZTo8L3A+XG4gICAgICogPHByZT5cbiAgICAgKiBmdW5jdGlvbiBwZXRUb1N0cmluZyhwZXQpIHtcbiAgICAgKiAgcmV0dXJuIHBldC5uYW1lO1xuICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6c3RyaW5nPX0gdG9TdHJGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB1c2VkXG4gICAgICogdG8gY29udmVydCBrZXlzIHRvIHN0cmluZ3MuIElmIHRoZSBrZXlzIGFyZW4ndCBzdHJpbmdzIG9yIGlmIHRvU3RyaW5nKClcbiAgICAgKiBpcyBub3QgYXBwcm9wcmlhdGUsIGEgY3VzdG9tIGZ1bmN0aW9uIHdoaWNoIHJlY2VpdmVzIGEga2V5IGFuZCByZXR1cm5zIGFcbiAgICAgKiB1bmlxdWUgc3RyaW5nIG11c3QgYmUgcHJvdmlkZWQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gRGljdGlvbmFyeSh0b1N0ckZ1bmN0aW9uKSB7XG4gICAgICAgIHRoaXMudGFibGUgPSB7fTtcbiAgICAgICAgdGhpcy5uRWxlbWVudHMgPSAwO1xuICAgICAgICB0aGlzLnRvU3RyID0gdG9TdHJGdW5jdGlvbiB8fCB1dGlsLmRlZmF1bHRUb1N0cmluZztcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdmFsdWUgdG8gd2hpY2ggdGhpcyBkaWN0aW9uYXJ5IG1hcHMgdGhlIHNwZWNpZmllZCBrZXkuXG4gICAgICogUmV0dXJucyB1bmRlZmluZWQgaWYgdGhpcyBkaWN0aW9uYXJ5IGNvbnRhaW5zIG5vIG1hcHBpbmcgZm9yIHRoaXMga2V5LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdob3NlIGFzc29jaWF0ZWQgdmFsdWUgaXMgdG8gYmUgcmV0dXJuZWQuXG4gICAgICogQHJldHVybiB7Kn0gdGhlIHZhbHVlIHRvIHdoaWNoIHRoaXMgZGljdGlvbmFyeSBtYXBzIHRoZSBzcGVjaWZpZWQga2V5IG9yXG4gICAgICogdW5kZWZpbmVkIGlmIHRoZSBtYXAgY29udGFpbnMgbm8gbWFwcGluZyBmb3IgdGhpcyBrZXkuXG4gICAgICovXG4gICAgRGljdGlvbmFyeS5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBwYWlyID0gdGhpcy50YWJsZVsnJCcgKyB0aGlzLnRvU3RyKGtleSldO1xuICAgICAgICBpZiAodXRpbC5pc1VuZGVmaW5lZChwYWlyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFpci52YWx1ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFzc29jaWF0ZXMgdGhlIHNwZWNpZmllZCB2YWx1ZSB3aXRoIHRoZSBzcGVjaWZpZWQga2V5IGluIHRoaXMgZGljdGlvbmFyeS5cbiAgICAgKiBJZiB0aGUgZGljdGlvbmFyeSBwcmV2aW91c2x5IGNvbnRhaW5lZCBhIG1hcHBpbmcgZm9yIHRoaXMga2V5LCB0aGUgb2xkXG4gICAgICogdmFsdWUgaXMgcmVwbGFjZWQgYnkgdGhlIHNwZWNpZmllZCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5IGtleSB3aXRoIHdoaWNoIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgdG8gYmVcbiAgICAgKiBhc3NvY2lhdGVkLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSB2YWx1ZSB0byBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXkuXG4gICAgICogQHJldHVybiB7Kn0gcHJldmlvdXMgdmFsdWUgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LCBvciB1bmRlZmluZWQgaWZcbiAgICAgKiB0aGVyZSB3YXMgbm8gbWFwcGluZyBmb3IgdGhlIGtleSBvciBpZiB0aGUga2V5L3ZhbHVlIGFyZSB1bmRlZmluZWQuXG4gICAgICovXG4gICAgRGljdGlvbmFyeS5wcm90b3R5cGUuc2V0VmFsdWUgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodXRpbC5pc1VuZGVmaW5lZChrZXkpIHx8IHV0aWwuaXNVbmRlZmluZWQodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHZhciByZXQ7XG4gICAgICAgIHZhciBrID0gJyQnICsgdGhpcy50b1N0cihrZXkpO1xuICAgICAgICB2YXIgcHJldmlvdXNFbGVtZW50ID0gdGhpcy50YWJsZVtrXTtcbiAgICAgICAgaWYgKHV0aWwuaXNVbmRlZmluZWQocHJldmlvdXNFbGVtZW50KSkge1xuICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMrKztcbiAgICAgICAgICAgIHJldCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldCA9IHByZXZpb3VzRWxlbWVudC52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRhYmxlW2tdID0ge1xuICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIG1hcHBpbmcgZm9yIHRoaXMga2V5IGZyb20gdGhpcyBkaWN0aW9uYXJ5IGlmIGl0IGlzIHByZXNlbnQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2hvc2UgbWFwcGluZyBpcyB0byBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICogZGljdGlvbmFyeS5cbiAgICAgKiBAcmV0dXJuIHsqfSBwcmV2aW91cyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggc3BlY2lmaWVkIGtleSwgb3IgdW5kZWZpbmVkIGlmXG4gICAgICogdGhlcmUgd2FzIG5vIG1hcHBpbmcgZm9yIGtleS5cbiAgICAgKi9cbiAgICBEaWN0aW9uYXJ5LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBrID0gJyQnICsgdGhpcy50b1N0cihrZXkpO1xuICAgICAgICB2YXIgcHJldmlvdXNFbGVtZW50ID0gdGhpcy50YWJsZVtrXTtcbiAgICAgICAgaWYgKCF1dGlsLmlzVW5kZWZpbmVkKHByZXZpb3VzRWxlbWVudCkpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRhYmxlW2tdO1xuICAgICAgICAgICAgdGhpcy5uRWxlbWVudHMtLTtcbiAgICAgICAgICAgIHJldHVybiBwcmV2aW91c0VsZW1lbnQudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGtleXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUga2V5cyBpbiB0aGlzIGRpY3Rpb25hcnkuXG4gICAgICovXG4gICAgRGljdGlvbmFyeS5wcm90b3R5cGUua2V5cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgIGZvciAodmFyIG5hbWVfMSBpbiB0aGlzLnRhYmxlKSB7XG4gICAgICAgICAgICBpZiAodXRpbC5oYXModGhpcy50YWJsZSwgbmFtZV8xKSkge1xuICAgICAgICAgICAgICAgIHZhciBwYWlyID0gdGhpcy50YWJsZVtuYW1lXzFdO1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2gocGFpci5rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIHZhbHVlcyBpbiB0aGlzIGRpY3Rpb25hcnkuXG4gICAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSB2YWx1ZXMgaW4gdGhpcyBkaWN0aW9uYXJ5LlxuICAgICAqL1xuICAgIERpY3Rpb25hcnkucHJvdG90eXBlLnZhbHVlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgIGZvciAodmFyIG5hbWVfMiBpbiB0aGlzLnRhYmxlKSB7XG4gICAgICAgICAgICBpZiAodXRpbC5oYXModGhpcy50YWJsZSwgbmFtZV8yKSkge1xuICAgICAgICAgICAgICAgIHZhciBwYWlyID0gdGhpcy50YWJsZVtuYW1lXzJdO1xuICAgICAgICAgICAgICAgIGFycmF5LnB1c2gocGFpci52YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2gga2V5LXZhbHVlIHBhaXJcbiAgICAgKiBwcmVzZW50IGluIHRoaXMgZGljdGlvbmFyeS5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzXG4gICAgICogaW52b2tlZCB3aXRoIHR3byBhcmd1bWVudHM6IGtleSBhbmQgdmFsdWUuIFRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhblxuICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxuICAgICAqL1xuICAgIERpY3Rpb25hcnkucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZV8zIGluIHRoaXMudGFibGUpIHtcbiAgICAgICAgICAgIGlmICh1dGlsLmhhcyh0aGlzLnRhYmxlLCBuYW1lXzMpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhaXIgPSB0aGlzLnRhYmxlW25hbWVfM107XG4gICAgICAgICAgICAgICAgdmFyIHJldCA9IGNhbGxiYWNrKHBhaXIua2V5LCBwYWlyLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGNvbnRhaW5zIGEgbWFwcGluZyBmb3IgdGhlIHNwZWNpZmllZCBrZXkuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2hvc2UgcHJlc2VuY2UgaW4gdGhpcyBkaWN0aW9uYXJ5IGlzIHRvIGJlXG4gICAgICogdGVzdGVkLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGNvbnRhaW5zIGEgbWFwcGluZyBmb3IgdGhlXG4gICAgICogc3BlY2lmaWVkIGtleS5cbiAgICAgKi9cbiAgICBEaWN0aW9uYXJ5LnByb3RvdHlwZS5jb250YWluc0tleSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgcmV0dXJuICF1dGlsLmlzVW5kZWZpbmVkKHRoaXMuZ2V0VmFsdWUoa2V5KSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBtYXBwaW5ncyBmcm9tIHRoaXMgZGljdGlvbmFyeS5cbiAgICAgKiBAdGhpcyB7Y29sbGVjdGlvbnMuRGljdGlvbmFyeX1cbiAgICAgKi9cbiAgICBEaWN0aW9uYXJ5LnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy50YWJsZSA9IHt9O1xuICAgICAgICB0aGlzLm5FbGVtZW50cyA9IDA7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2Yga2V5cyBpbiB0aGlzIGRpY3Rpb25hcnkuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGtleS12YWx1ZSBtYXBwaW5ncyBpbiB0aGlzIGRpY3Rpb25hcnkuXG4gICAgICovXG4gICAgRGljdGlvbmFyeS5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBubyBtYXBwaW5ncy5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBubyBtYXBwaW5ncy5cbiAgICAgKi9cbiAgICBEaWN0aW9uYXJ5LnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uRWxlbWVudHMgPD0gMDtcbiAgICB9O1xuICAgIERpY3Rpb25hcnkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdG9yZXQgPSAneyc7XG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoaywgdikge1xuICAgICAgICAgICAgdG9yZXQgKz0gXCJcXG5cXHRcIiArIGsgKyBcIiA6IFwiICsgdjtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0b3JldCArICdcXG59JztcbiAgICB9O1xuICAgIHJldHVybiBEaWN0aW9uYXJ5O1xufSgpKTsgLy8gRW5kIG9mIGRpY3Rpb25hcnlcbmV4cG9ydHMuZGVmYXVsdCA9IERpY3Rpb25hcnk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1EaWN0aW9uYXJ5LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgRGljdGlvbmFyeV8xID0gcmVxdWlyZShcIi4vRGljdGlvbmFyeVwiKTtcbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbnZhciBGYWN0b3J5RGljdGlvbmFyeSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoRmFjdG9yeURpY3Rpb25hcnksIF9zdXBlcik7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBlbXB0eSBkaWN0aW9uYXJ5LlxuICAgICAqIEBjbGFzcyA8cD5EaWN0aW9uYXJpZXMgbWFwIGtleXMgdG8gdmFsdWVzOyBlYWNoIGtleSBjYW4gbWFwIHRvIGF0IG1vc3Qgb25lIHZhbHVlLlxuICAgICAqIFRoaXMgaW1wbGVtZW50YXRpb24gYWNjZXB0cyBhbnkga2luZCBvZiBvYmplY3RzIGFzIGtleXMuPC9wPlxuICAgICAqXG4gICAgICogPHA+VGhlIGRlZmF1bHQgZmFjdG9yeSBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIGEgbmV3IG9iamVjdCBvZiB0aGUgcHJvdmlkZWRcbiAgICAgKiB0eXBlLiBFeGFtcGxlOjwvcD5cbiAgICAgKiA8cHJlPlxuICAgICAqIGZ1bmN0aW9uIHBldEZhY3RvcnkoKSB7XG4gICAgICogIHJldHVybiBuZXcgUGV0KCk7XG4gICAgICogfVxuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogPHA+SWYgdGhlIGtleXMgYXJlIGN1c3RvbSBvYmplY3RzIGEgZnVuY3Rpb24gd2hpY2ggY29udmVydHMga2V5cyB0byB1bmlxdWVcbiAgICAgKiBzdHJpbmdzIG11c3QgYmUgcHJvdmlkZWQuIEV4YW1wbGU6PC9wPlxuICAgICAqIDxwcmU+XG4gICAgICogZnVuY3Rpb24gcGV0VG9TdHJpbmcocGV0KSB7XG4gICAgICogIHJldHVybiBwZXQubmFtZTtcbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbigpOlY9fSBkZWZhdWx0RmFjdG9yeUZ1bmN0aW9uIGZ1bmN0aW9uIHVzZWQgdG8gY3JlYXRlIGFcbiAgICAgKiBkZWZhdWx0IG9iamVjdC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6c3RyaW5nPX0gdG9TdHJGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB1c2VkXG4gICAgICogdG8gY29udmVydCBrZXlzIHRvIHN0cmluZ3MuIElmIHRoZSBrZXlzIGFyZW4ndCBzdHJpbmdzIG9yIGlmIHRvU3RyaW5nKClcbiAgICAgKiBpcyBub3QgYXBwcm9wcmlhdGUsIGEgY3VzdG9tIGZ1bmN0aW9uIHdoaWNoIHJlY2VpdmVzIGEga2V5IGFuZCByZXR1cm5zIGFcbiAgICAgKiB1bmlxdWUgc3RyaW5nIG11c3QgYmUgcHJvdmlkZWQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gRmFjdG9yeURpY3Rpb25hcnkoZGVmYXVsdEZhY3RvcnlGdW5jdGlvbiwgdG9TdHJGdW5jdGlvbikge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCB0b1N0ckZ1bmN0aW9uKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5kZWZhdWx0RmFjdG9yeUZ1bmN0aW9uID0gZGVmYXVsdEZhY3RvcnlGdW5jdGlvbjtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBc3NvY2lhdGVzIHRoZSBzcGVjaWZpZWQgZGVmYXVsdCB2YWx1ZSB3aXRoIHRoZSBzcGVjaWZpZWQga2V5IGluIHRoaXMgZGljdGlvbmFyeSxcbiAgICAgKiBpZiBpdCBkaWRuJ3QgY29udGFpbiB0aGUga2V5IHlldC4gSWYgdGhlIGtleSBleGlzdGVkLCB0aGUgZXhpc3RpbmcgdmFsdWUgd2lsbCBiZSB1c2VkLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdpdGggd2hpY2ggdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyB0byBiZVxuICAgICAqIGFzc29jaWF0ZWQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRlZmF1bHRWYWx1ZSBkZWZhdWx0IHZhbHVlIHRvIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleS5cbiAgICAgKiBAcmV0dXJuIHsqfSBwcmV2aW91cyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXksIG9yIHRoZSBkZWZhdWx0IHZhbHVlLFxuICAgICAqIGlmIHRoZSBrZXkgZGlkbid0IGV4aXN0IHlldC5cbiAgICAgKi9cbiAgICBGYWN0b3J5RGljdGlvbmFyeS5wcm90b3R5cGUuc2V0RGVmYXVsdCA9IGZ1bmN0aW9uIChrZXksIGRlZmF1bHRWYWx1ZSkge1xuICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gX3N1cGVyLnByb3RvdHlwZS5nZXRWYWx1ZS5jYWxsKHRoaXMsIGtleSk7XG4gICAgICAgIGlmICh1dGlsLmlzVW5kZWZpbmVkKGN1cnJlbnRWYWx1ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0VmFsdWUoa2V5LCBkZWZhdWx0VmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgdmFsdWUgdG8gd2hpY2ggdGhpcyBkaWN0aW9uYXJ5IG1hcHMgdGhlIHNwZWNpZmllZCBrZXkuXG4gICAgICogUmV0dXJucyBhIGRlZmF1bHQgdmFsdWUgY3JlYXRlZCBieSB0aGUgZmFjdG9yeSBwYXNzZWQgaW4gdGhlIGNvbnN0cnVjdG9yLFxuICAgICAqIGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBubyBtYXBwaW5nIGZvciB0aGlzIGtleS4gVGhlIG1pc3Npbmcga2V5IHdpbGxcbiAgICAgKiBhdXRvbWF0aWNhbGx5IGJlIGFkZGVkIHRvIHRoZSBkaWN0aW9uYXJ5LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdob3NlIGFzc29jaWF0ZWQgdmFsdWUgaXMgdG8gYmUgcmV0dXJuZWQuXG4gICAgICogQHJldHVybiB7Kn0gdGhlIHZhbHVlIHRvIHdoaWNoIHRoaXMgZGljdGlvbmFyeSBtYXBzIHRoZSBzcGVjaWZpZWQga2V5IG9yXG4gICAgICogYSBkZWZhdWx0IHZhbHVlIGlmIHRoZSBtYXAgY29udGFpbnMgbm8gbWFwcGluZyBmb3IgdGhpcyBrZXkuXG4gICAgICovXG4gICAgRmFjdG9yeURpY3Rpb25hcnkucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXREZWZhdWx0KGtleSwgdGhpcy5kZWZhdWx0RmFjdG9yeUZ1bmN0aW9uKCkpO1xuICAgIH07XG4gICAgcmV0dXJuIEZhY3RvcnlEaWN0aW9uYXJ5O1xufShEaWN0aW9uYXJ5XzEuZGVmYXVsdCkpO1xuZXhwb3J0cy5kZWZhdWx0ID0gRmFjdG9yeURpY3Rpb25hcnk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1GYWN0b3J5RGljdGlvbmFyeS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBjb2xsZWN0aW9ucyA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG52YXIgYXJyYXlzID0gcmVxdWlyZShcIi4vYXJyYXlzXCIpO1xudmFyIEhlYXAgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBlbXB0eSBIZWFwLlxuICAgICAqIEBjbGFzc1xuICAgICAqIDxwPkEgaGVhcCBpcyBhIGJpbmFyeSB0cmVlLCB3aGVyZSB0aGUgbm9kZXMgbWFpbnRhaW4gdGhlIGhlYXAgcHJvcGVydHk6XG4gICAgICogZWFjaCBub2RlIGlzIHNtYWxsZXIgdGhhbiBlYWNoIG9mIGl0cyBjaGlsZHJlbiBhbmQgdGhlcmVmb3JlIGEgTWluSGVhcFxuICAgICAqIFRoaXMgaW1wbGVtZW50YXRpb24gdXNlcyBhbiBhcnJheSB0byBzdG9yZSBlbGVtZW50cy48L3A+XG4gICAgICogPHA+SWYgdGhlIGluc2VydGVkIGVsZW1lbnRzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGNvbXBhcmUgZnVuY3Rpb24gbXVzdCBiZSBwcm92aWRlZCxcbiAgICAgKiAgYXQgY29uc3RydWN0aW9uIHRpbWUsIG90aGVyd2lzZSB0aGUgPD0sID09PSBhbmQgPj0gb3BlcmF0b3JzIGFyZVxuICAgICAqIHVzZWQgdG8gY29tcGFyZSBlbGVtZW50cy4gRXhhbXBsZTo8L3A+XG4gICAgICpcbiAgICAgKiA8cHJlPlxuICAgICAqIGZ1bmN0aW9uIGNvbXBhcmUoYSwgYikge1xuICAgICAqICBpZiAoYSBpcyBsZXNzIHRoYW4gYiBieSBzb21lIG9yZGVyaW5nIGNyaXRlcmlvbikge1xuICAgICAqICAgICByZXR1cm4gLTE7XG4gICAgICogIH0gaWYgKGEgaXMgZ3JlYXRlciB0aGFuIGIgYnkgdGhlIG9yZGVyaW5nIGNyaXRlcmlvbikge1xuICAgICAqICAgICByZXR1cm4gMTtcbiAgICAgKiAgfVxuICAgICAqICAvLyBhIG11c3QgYmUgZXF1YWwgdG8gYlxuICAgICAqICByZXR1cm4gMDtcbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICpcbiAgICAgKiA8cD5JZiBhIE1heC1IZWFwIGlzIHdhbnRlZCAoZ3JlYXRlciBlbGVtZW50cyBvbiB0b3ApIHlvdSBjYW4gYSBwcm92aWRlIGFcbiAgICAgKiByZXZlcnNlIGNvbXBhcmUgZnVuY3Rpb24gdG8gYWNjb21wbGlzaCB0aGF0IGJlaGF2aW9yLiBFeGFtcGxlOjwvcD5cbiAgICAgKlxuICAgICAqIDxwcmU+XG4gICAgICogZnVuY3Rpb24gcmV2ZXJzZUNvbXBhcmUoYSwgYikge1xuICAgICAqICBpZiAoYSBpcyBsZXNzIHRoYW4gYiBieSBzb21lIG9yZGVyaW5nIGNyaXRlcmlvbikge1xuICAgICAqICAgICByZXR1cm4gMTtcbiAgICAgKiAgfSBpZiAoYSBpcyBncmVhdGVyIHRoYW4gYiBieSB0aGUgb3JkZXJpbmcgY3JpdGVyaW9uKSB7XG4gICAgICogICAgIHJldHVybiAtMTtcbiAgICAgKiAgfVxuICAgICAqICAvLyBhIG11c3QgYmUgZXF1YWwgdG8gYlxuICAgICAqICByZXR1cm4gMDtcbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICpcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOm51bWJlcj19IGNvbXBhcmVGdW5jdGlvbiBvcHRpb25hbFxuICAgICAqIGZ1bmN0aW9uIHVzZWQgdG8gY29tcGFyZSB0d28gZWxlbWVudHMuIE11c3QgcmV0dXJuIGEgbmVnYXRpdmUgaW50ZWdlcixcbiAgICAgKiB6ZXJvLCBvciBhIHBvc2l0aXZlIGludGVnZXIgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIGxlc3MgdGhhbiwgZXF1YWwgdG8sXG4gICAgICogb3IgZ3JlYXRlciB0aGFuIHRoZSBzZWNvbmQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gSGVhcChjb21wYXJlRnVuY3Rpb24pIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFycmF5IHVzZWQgdG8gc3RvcmUgdGhlIGVsZW1lbnRzIG9mIHRoZSBoZWFwLlxuICAgICAgICAgKiBAdHlwZSB7QXJyYXkuPE9iamVjdD59XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmRhdGEgPSBbXTtcbiAgICAgICAgdGhpcy5jb21wYXJlID0gY29tcGFyZUZ1bmN0aW9uIHx8IGNvbGxlY3Rpb25zLmRlZmF1bHRDb21wYXJlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbGVmdCBjaGlsZCBvZiB0aGUgbm9kZSBhdCB0aGUgZ2l2ZW4gaW5kZXguXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG5vZGVJbmRleCBUaGUgaW5kZXggb2YgdGhlIG5vZGUgdG8gZ2V0IHRoZSBsZWZ0IGNoaWxkXG4gICAgICogZm9yLlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIGluZGV4IG9mIHRoZSBsZWZ0IGNoaWxkLlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgSGVhcC5wcm90b3R5cGUubGVmdENoaWxkSW5kZXggPSBmdW5jdGlvbiAobm9kZUluZGV4KSB7XG4gICAgICAgIHJldHVybiAoMiAqIG5vZGVJbmRleCkgKyAxO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIHJpZ2h0IGNoaWxkIG9mIHRoZSBub2RlIGF0IHRoZSBnaXZlbiBpbmRleC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbm9kZUluZGV4IFRoZSBpbmRleCBvZiB0aGUgbm9kZSB0byBnZXQgdGhlIHJpZ2h0IGNoaWxkXG4gICAgICogZm9yLlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gVGhlIGluZGV4IG9mIHRoZSByaWdodCBjaGlsZC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIEhlYXAucHJvdG90eXBlLnJpZ2h0Q2hpbGRJbmRleCA9IGZ1bmN0aW9uIChub2RlSW5kZXgpIHtcbiAgICAgICAgcmV0dXJuICgyICogbm9kZUluZGV4KSArIDI7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgcGFyZW50IG9mIHRoZSBub2RlIGF0IHRoZSBnaXZlbiBpbmRleC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbm9kZUluZGV4IFRoZSBpbmRleCBvZiB0aGUgbm9kZSB0byBnZXQgdGhlIHBhcmVudCBmb3IuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSBUaGUgaW5kZXggb2YgdGhlIHBhcmVudC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIEhlYXAucHJvdG90eXBlLnBhcmVudEluZGV4ID0gZnVuY3Rpb24gKG5vZGVJbmRleCkge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigobm9kZUluZGV4IC0gMSkgLyAyKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBzbWFsbGVyIGNoaWxkIG5vZGUgKGlmIGl0IGV4aXN0cykuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGxlZnRDaGlsZCBsZWZ0IGNoaWxkIGluZGV4LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByaWdodENoaWxkIHJpZ2h0IGNoaWxkIGluZGV4LlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIGluZGV4IHdpdGggdGhlIG1pbmltdW0gdmFsdWUgb3IgLTEgaWYgaXQgZG9lc24ndFxuICAgICAqIGV4aXN0cy5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIEhlYXAucHJvdG90eXBlLm1pbkluZGV4ID0gZnVuY3Rpb24gKGxlZnRDaGlsZCwgcmlnaHRDaGlsZCkge1xuICAgICAgICBpZiAocmlnaHRDaGlsZCA+PSB0aGlzLmRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAobGVmdENoaWxkID49IHRoaXMuZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdENoaWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuY29tcGFyZSh0aGlzLmRhdGFbbGVmdENoaWxkXSwgdGhpcy5kYXRhW3JpZ2h0Q2hpbGRdKSA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRDaGlsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiByaWdodENoaWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0aGUgbm9kZSBhdCB0aGUgZ2l2ZW4gaW5kZXggdXAgdG8gaXRzIHByb3BlciBwbGFjZSBpbiB0aGUgaGVhcC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBub2RlIHRvIG1vdmUgdXAuXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBIZWFwLnByb3RvdHlwZS5zaWZ0VXAgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50SW5kZXgoaW5kZXgpO1xuICAgICAgICB3aGlsZSAoaW5kZXggPiAwICYmIHRoaXMuY29tcGFyZSh0aGlzLmRhdGFbcGFyZW50XSwgdGhpcy5kYXRhW2luZGV4XSkgPiAwKSB7XG4gICAgICAgICAgICBhcnJheXMuc3dhcCh0aGlzLmRhdGEsIHBhcmVudCwgaW5kZXgpO1xuICAgICAgICAgICAgaW5kZXggPSBwYXJlbnQ7XG4gICAgICAgICAgICBwYXJlbnQgPSB0aGlzLnBhcmVudEluZGV4KGluZGV4KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogTW92ZXMgdGhlIG5vZGUgYXQgdGhlIGdpdmVuIGluZGV4IGRvd24gdG8gaXRzIHByb3BlciBwbGFjZSBpbiB0aGUgaGVhcC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gbm9kZUluZGV4IFRoZSBpbmRleCBvZiB0aGUgbm9kZSB0byBtb3ZlIGRvd24uXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBIZWFwLnByb3RvdHlwZS5zaWZ0RG93biA9IGZ1bmN0aW9uIChub2RlSW5kZXgpIHtcbiAgICAgICAgLy9zbWFsbGVyIGNoaWxkIGluZGV4XG4gICAgICAgIHZhciBtaW4gPSB0aGlzLm1pbkluZGV4KHRoaXMubGVmdENoaWxkSW5kZXgobm9kZUluZGV4KSwgdGhpcy5yaWdodENoaWxkSW5kZXgobm9kZUluZGV4KSk7XG4gICAgICAgIHdoaWxlIChtaW4gPj0gMCAmJiB0aGlzLmNvbXBhcmUodGhpcy5kYXRhW25vZGVJbmRleF0sIHRoaXMuZGF0YVttaW5dKSA+IDApIHtcbiAgICAgICAgICAgIGFycmF5cy5zd2FwKHRoaXMuZGF0YSwgbWluLCBub2RlSW5kZXgpO1xuICAgICAgICAgICAgbm9kZUluZGV4ID0gbWluO1xuICAgICAgICAgICAgbWluID0gdGhpcy5taW5JbmRleCh0aGlzLmxlZnRDaGlsZEluZGV4KG5vZGVJbmRleCksIHRoaXMucmlnaHRDaGlsZEluZGV4KG5vZGVJbmRleCkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgYnV0IGRvZXMgbm90IHJlbW92ZSB0aGUgcm9vdCBlbGVtZW50IG9mIHRoaXMgaGVhcC5cbiAgICAgKiBAcmV0dXJuIHsqfSBUaGUgdmFsdWUgYXQgdGhlIHJvb3Qgb2YgdGhlIGhlYXAuIFJldHVybnMgdW5kZWZpbmVkIGlmIHRoZVxuICAgICAqIGhlYXAgaXMgZW1wdHkuXG4gICAgICovXG4gICAgSGVhcC5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhWzBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgZ2l2ZW4gZWxlbWVudCBpbnRvIHRoZSBoZWFwLlxuICAgICAqIEBwYXJhbSB7Kn0gZWxlbWVudCB0aGUgZWxlbWVudC5cbiAgICAgKiBAcmV0dXJuIHRydWUgaWYgdGhlIGVsZW1lbnQgd2FzIGFkZGVkIG9yIGZhbHMgaWYgaXQgaXMgdW5kZWZpbmVkLlxuICAgICAqL1xuICAgIEhlYXAucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGlmIChjb2xsZWN0aW9ucy5pc1VuZGVmaW5lZChlbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGF0YS5wdXNoKGVsZW1lbnQpO1xuICAgICAgICB0aGlzLnNpZnRVcCh0aGlzLmRhdGEubGVuZ3RoIC0gMSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIGFuZCByZW1vdmVzIHRoZSByb290IGVsZW1lbnQgb2YgdGhpcyBoZWFwLlxuICAgICAqIEByZXR1cm4geyp9IFRoZSB2YWx1ZSByZW1vdmVkIGZyb20gdGhlIHJvb3Qgb2YgdGhlIGhlYXAuIFJldHVybnNcbiAgICAgKiB1bmRlZmluZWQgaWYgdGhlIGhlYXAgaXMgZW1wdHkuXG4gICAgICovXG4gICAgSGVhcC5wcm90b3R5cGUucmVtb3ZlUm9vdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gdGhpcy5kYXRhWzBdO1xuICAgICAgICAgICAgdGhpcy5kYXRhWzBdID0gdGhpcy5kYXRhW3RoaXMuZGF0YS5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIHRoaXMuZGF0YS5zcGxpY2UodGhpcy5kYXRhLmxlbmd0aCAtIDEsIDEpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaWZ0RG93bigwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGhlYXAgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IGVsZW1lbnQgdG8gc2VhcmNoIGZvci5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgSGVhcCBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQsIGZhbHNlXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIEhlYXAucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIGVxdUYgPSBjb2xsZWN0aW9ucy5jb21wYXJlVG9FcXVhbHModGhpcy5jb21wYXJlKTtcbiAgICAgICAgcmV0dXJuIGFycmF5cy5jb250YWlucyh0aGlzLmRhdGEsIGVsZW1lbnQsIGVxdUYpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgaGVhcC5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBoZWFwLlxuICAgICAqL1xuICAgIEhlYXAucHJvdG90eXBlLnNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEubGVuZ3RoO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIGlmIHRoaXMgaGVhcCBpcyBlbXB0eS5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIGFuZCBvbmx5IGlmIHRoaXMgaGVhcCBjb250YWlucyBubyBpdGVtczsgZmFsc2VcbiAgICAgKiBvdGhlcndpc2UuXG4gICAgICovXG4gICAgSGVhcC5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5sZW5ndGggPD0gMDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgaGVhcC5cbiAgICAgKi9cbiAgICBIZWFwLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5kYXRhLmxlbmd0aCA9IDA7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyBoZWFwIGluXG4gICAgICogbm8gcGFydGljdWxhciBvcmRlci5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcbiAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuXG4gICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgICovXG4gICAgSGVhcC5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICBhcnJheXMuZm9yRWFjaCh0aGlzLmRhdGEsIGNhbGxiYWNrKTtcbiAgICB9O1xuICAgIHJldHVybiBIZWFwO1xufSgpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IEhlYXA7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1IZWFwLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoYi5oYXNPd25Qcm9wZXJ0eShwKSkgZFtwXSA9IGJbcF07IH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChkLCBiKSB7XG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XG4gICAgICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgICAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG4gICAgfTtcbn0pKCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgRGljdGlvbmFyeV8xID0gcmVxdWlyZShcIi4vRGljdGlvbmFyeVwiKTtcbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbi8qKlxuICogVGhpcyBjbGFzcyBpcyB1c2VkIGJ5IHRoZSBMaW5rZWREaWN0aW9uYXJ5IEludGVybmFsbHlcbiAqIEhhcyB0byBiZSBhIGNsYXNzLCBub3QgYW4gaW50ZXJmYWNlLCBiZWNhdXNlIGl0IG5lZWRzIHRvIGhhdmVcbiAqIHRoZSAndW5saW5rJyBmdW5jdGlvbiBkZWZpbmVkLlxuICovXG52YXIgTGlua2VkRGljdGlvbmFyeVBhaXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTGlua2VkRGljdGlvbmFyeVBhaXIoa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLmtleSA9IGtleTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBMaW5rZWREaWN0aW9uYXJ5UGFpci5wcm90b3R5cGUudW5saW5rID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnByZXYubmV4dCA9IHRoaXMubmV4dDtcbiAgICAgICAgdGhpcy5uZXh0LnByZXYgPSB0aGlzLnByZXY7XG4gICAgfTtcbiAgICByZXR1cm4gTGlua2VkRGljdGlvbmFyeVBhaXI7XG59KCkpO1xuLyoqXG4gKiBUaGUgaGVhZCBhbmQgdGFpbCBlbGVtZW50cyBvZiB0aGUgbGlzdCBoYXZlIG51bGwga2V5IGFuZCB2YWx1ZSBwcm9wZXJ0aWVzIGJ1dCB0aGV5XG4gKiB1c3VhbGx5IGxpbmsgdG8gbm9ybWFsIG5vZGVzLlxuICovXG52YXIgSGVhZE9yVGFpbExpbmtlZERpY3Rpb25hcnlQYWlyID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEhlYWRPclRhaWxMaW5rZWREaWN0aW9uYXJ5UGFpcigpIHtcbiAgICAgICAgdGhpcy5rZXkgPSBudWxsO1xuICAgICAgICB0aGlzLnZhbHVlID0gbnVsbDtcbiAgICB9XG4gICAgSGVhZE9yVGFpbExpbmtlZERpY3Rpb25hcnlQYWlyLnByb3RvdHlwZS51bmxpbmsgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucHJldi5uZXh0ID0gdGhpcy5uZXh0O1xuICAgICAgICB0aGlzLm5leHQucHJldiA9IHRoaXMucHJldjtcbiAgICB9O1xuICAgIHJldHVybiBIZWFkT3JUYWlsTGlua2VkRGljdGlvbmFyeVBhaXI7XG59KCkpO1xuZnVuY3Rpb24gaXNIZWFkT3JUYWlsTGlua2VkRGljdGlvbmFyeVBhaXIocCkge1xuICAgIHJldHVybiAhcC5uZXh0O1xufVxudmFyIExpbmtlZERpY3Rpb25hcnkgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKExpbmtlZERpY3Rpb25hcnksIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gTGlua2VkRGljdGlvbmFyeSh0b1N0ckZ1bmN0aW9uKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIHRvU3RyRnVuY3Rpb24pIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmhlYWQgPSBuZXcgSGVhZE9yVGFpbExpbmtlZERpY3Rpb25hcnlQYWlyKCk7XG4gICAgICAgIF90aGlzLnRhaWwgPSBuZXcgSGVhZE9yVGFpbExpbmtlZERpY3Rpb25hcnlQYWlyKCk7XG4gICAgICAgIF90aGlzLmhlYWQubmV4dCA9IF90aGlzLnRhaWw7XG4gICAgICAgIF90aGlzLnRhaWwucHJldiA9IF90aGlzLmhlYWQ7XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGUgbmV3IG5vZGUgdG8gdGhlICd0YWlsJyBvZiB0aGUgbGlzdCwgdXBkYXRpbmcgdGhlXG4gICAgICogbmVpZ2hib3JzLCBhbmQgbW92aW5nICd0aGlzLnRhaWwnICh0aGUgRW5kIG9mIExpc3QgaW5kaWNhdG9yKSB0aGF0XG4gICAgICogdG8gdGhlIGVuZC5cbiAgICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS5hcHBlbmRUb1RhaWwgPSBmdW5jdGlvbiAoZW50cnkpIHtcbiAgICAgICAgdmFyIGxhc3ROb2RlID0gdGhpcy50YWlsLnByZXY7XG4gICAgICAgIGxhc3ROb2RlLm5leHQgPSBlbnRyeTtcbiAgICAgICAgZW50cnkucHJldiA9IGxhc3ROb2RlO1xuICAgICAgICBlbnRyeS5uZXh0ID0gdGhpcy50YWlsO1xuICAgICAgICB0aGlzLnRhaWwucHJldiA9IGVudHJ5O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIGEgbGlua2VkIGRpY3Rpb25hcnkgZnJvbSB0aGUgdGFibGUgaW50ZXJuYWxseVxuICAgICAqL1xuICAgIExpbmtlZERpY3Rpb25hcnkucHJvdG90eXBlLmdldExpbmtlZERpY3Rpb25hcnlQYWlyID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpZiAodXRpbC5pc1VuZGVmaW5lZChrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHZhciBrID0gJyQnICsgdGhpcy50b1N0cihrZXkpO1xuICAgICAgICB2YXIgcGFpciA9ICh0aGlzLnRhYmxlW2tdKTtcbiAgICAgICAgcmV0dXJuIHBhaXI7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSB0byB3aGljaCB0aGlzIGRpY3Rpb25hcnkgbWFwcyB0aGUgc3BlY2lmaWVkIGtleS5cbiAgICAgKiBSZXR1cm5zIHVuZGVmaW5lZCBpZiB0aGlzIGRpY3Rpb25hcnkgY29udGFpbnMgbm8gbWFwcGluZyBmb3IgdGhpcyBrZXkuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2hvc2UgYXNzb2NpYXRlZCB2YWx1ZSBpcyB0byBiZSByZXR1cm5lZC5cbiAgICAgKiBAcmV0dXJuIHsqfSB0aGUgdmFsdWUgdG8gd2hpY2ggdGhpcyBkaWN0aW9uYXJ5IG1hcHMgdGhlIHNwZWNpZmllZCBrZXkgb3JcbiAgICAgKiB1bmRlZmluZWQgaWYgdGhlIG1hcCBjb250YWlucyBubyBtYXBwaW5nIGZvciB0aGlzIGtleS5cbiAgICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdmFyIHBhaXIgPSB0aGlzLmdldExpbmtlZERpY3Rpb25hcnlQYWlyKGtleSk7XG4gICAgICAgIGlmICghdXRpbC5pc1VuZGVmaW5lZChwYWlyKSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhaXIudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIG1hcHBpbmcgZm9yIHRoaXMga2V5IGZyb20gdGhpcyBkaWN0aW9uYXJ5IGlmIGl0IGlzIHByZXNlbnQuXG4gICAgICogQWxzbywgaWYgYSB2YWx1ZSBpcyBwcmVzZW50IGZvciB0aGlzIGtleSwgdGhlIGVudHJ5IGlzIHJlbW92ZWQgZnJvbSB0aGVcbiAgICAgKiBpbnNlcnRpb24gb3JkZXJpbmcuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2hvc2UgbWFwcGluZyBpcyB0byBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICogZGljdGlvbmFyeS5cbiAgICAgKiBAcmV0dXJuIHsqfSBwcmV2aW91cyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggc3BlY2lmaWVkIGtleSwgb3IgdW5kZWZpbmVkIGlmXG4gICAgICogdGhlcmUgd2FzIG5vIG1hcHBpbmcgZm9yIGtleS5cbiAgICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIHZhciBwYWlyID0gdGhpcy5nZXRMaW5rZWREaWN0aW9uYXJ5UGFpcihrZXkpO1xuICAgICAgICBpZiAoIXV0aWwuaXNVbmRlZmluZWQocGFpcikpIHtcbiAgICAgICAgICAgIF9zdXBlci5wcm90b3R5cGUucmVtb3ZlLmNhbGwodGhpcywga2V5KTsgLy8gVGhpcyB3aWxsIHJlbW92ZSBpdCBmcm9tIHRoZSB0YWJsZVxuICAgICAgICAgICAgcGFpci51bmxpbmsoKTsgLy8gVGhpcyB3aWxsIHVubGluayBpdCBmcm9tIHRoZSBjaGFpblxuICAgICAgICAgICAgcmV0dXJuIHBhaXIudmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIG1hcHBpbmdzIGZyb20gdGhpcyBMaW5rZWREaWN0aW9uYXJ5LlxuICAgICAqIEB0aGlzIHtjb2xsZWN0aW9ucy5MaW5rZWREaWN0aW9uYXJ5fVxuICAgICAqL1xuICAgIExpbmtlZERpY3Rpb25hcnkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBfc3VwZXIucHJvdG90eXBlLmNsZWFyLmNhbGwodGhpcyk7XG4gICAgICAgIHRoaXMuaGVhZC5uZXh0ID0gdGhpcy50YWlsO1xuICAgICAgICB0aGlzLnRhaWwucHJldiA9IHRoaXMuaGVhZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEludGVybmFsIGZ1bmN0aW9uIHVzZWQgd2hlbiB1cGRhdGluZyBhbiBleGlzdGluZyBLZXlWYWx1ZSBwYWlyLlxuICAgICAqIEl0IHBsYWNlcyB0aGUgbmV3IHZhbHVlIGluZGV4ZWQgYnkga2V5IGludG8gdGhlIHRhYmxlLCBidXQgbWFpbnRhaW5zXG4gICAgICogaXRzIHBsYWNlIGluIHRoZSBsaW5rZWQgb3JkZXJpbmcuXG4gICAgICovXG4gICAgTGlua2VkRGljdGlvbmFyeS5wcm90b3R5cGUucmVwbGFjZSA9IGZ1bmN0aW9uIChvbGRQYWlyLCBuZXdQYWlyKSB7XG4gICAgICAgIHZhciBrID0gJyQnICsgdGhpcy50b1N0cihuZXdQYWlyLmtleSk7XG4gICAgICAgIC8vIHNldCB0aGUgbmV3IFBhaXIncyBsaW5rcyB0byBleGlzdGluZ1BhaXIncyBsaW5rc1xuICAgICAgICBuZXdQYWlyLm5leHQgPSBvbGRQYWlyLm5leHQ7XG4gICAgICAgIG5ld1BhaXIucHJldiA9IG9sZFBhaXIucHJldjtcbiAgICAgICAgLy8gRGVsZXRlIEV4aXN0aW5nIFBhaXIgZnJvbSB0aGUgdGFibGUsIHVubGluayBpdCBmcm9tIGNoYWluLlxuICAgICAgICAvLyBBcyBhIHJlc3VsdCwgdGhlIG5FbGVtZW50cyBnZXRzIGRlY3JlbWVudGVkIGJ5IHRoaXMgb3BlcmF0aW9uXG4gICAgICAgIHRoaXMucmVtb3ZlKG9sZFBhaXIua2V5KTtcbiAgICAgICAgLy8gTGluayBuZXcgUGFpciBpbiBwbGFjZSBvZiB3aGVyZSBvbGRQYWlyIHdhcyxcbiAgICAgICAgLy8gYnkgcG9pbnRpbmcgdGhlIG9sZCBwYWlyJ3MgbmVpZ2hib3JzIHRvIGl0LlxuICAgICAgICBuZXdQYWlyLnByZXYubmV4dCA9IG5ld1BhaXI7XG4gICAgICAgIG5ld1BhaXIubmV4dC5wcmV2ID0gbmV3UGFpcjtcbiAgICAgICAgdGhpcy50YWJsZVtrXSA9IG5ld1BhaXI7XG4gICAgICAgIC8vIFRvIG1ha2UgdXAgZm9yIHRoZSBmYWN0IHRoYXQgdGhlIG51bWJlciBvZiBlbGVtZW50cyB3YXMgZGVjcmVtZW50ZWQsXG4gICAgICAgIC8vIFdlIG5lZWQgdG8gaW5jcmVhc2UgaXQgYnkgb25lLlxuICAgICAgICArK3RoaXMubkVsZW1lbnRzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQXNzb2NpYXRlcyB0aGUgc3BlY2lmaWVkIHZhbHVlIHdpdGggdGhlIHNwZWNpZmllZCBrZXkgaW4gdGhpcyBkaWN0aW9uYXJ5LlxuICAgICAqIElmIHRoZSBkaWN0aW9uYXJ5IHByZXZpb3VzbHkgY29udGFpbmVkIGEgbWFwcGluZyBmb3IgdGhpcyBrZXksIHRoZSBvbGRcbiAgICAgKiB2YWx1ZSBpcyByZXBsYWNlZCBieSB0aGUgc3BlY2lmaWVkIHZhbHVlLlxuICAgICAqIFVwZGF0aW5nIG9mIGEga2V5IHRoYXQgYWxyZWFkeSBleGlzdHMgbWFpbnRhaW5zIGl0cyBwbGFjZSBpbiB0aGVcbiAgICAgKiBpbnNlcnRpb24gb3JkZXIgaW50byB0aGUgbWFwLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdpdGggd2hpY2ggdGhlIHNwZWNpZmllZCB2YWx1ZSBpcyB0byBiZVxuICAgICAqIGFzc29jaWF0ZWQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IHZhbHVlIHZhbHVlIHRvIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3BlY2lmaWVkIGtleS5cbiAgICAgKiBAcmV0dXJuIHsqfSBwcmV2aW91cyB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXksIG9yIHVuZGVmaW5lZCBpZlxuICAgICAqIHRoZXJlIHdhcyBubyBtYXBwaW5nIGZvciB0aGUga2V5IG9yIGlmIHRoZSBrZXkvdmFsdWUgYXJlIHVuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICh1dGlsLmlzVW5kZWZpbmVkKGtleSkgfHwgdXRpbC5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGV4aXN0aW5nUGFpciA9IHRoaXMuZ2V0TGlua2VkRGljdGlvbmFyeVBhaXIoa2V5KTtcbiAgICAgICAgdmFyIG5ld1BhaXIgPSBuZXcgTGlua2VkRGljdGlvbmFyeVBhaXIoa2V5LCB2YWx1ZSk7XG4gICAgICAgIHZhciBrID0gJyQnICsgdGhpcy50b1N0cihrZXkpO1xuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGFuIGVsZW1lbnQgZm9yIHRoYXQga2V5LCB3ZVxuICAgICAgICAvLyBrZWVwIGl0J3MgcGxhY2UgaW4gdGhlIExpbmtlZExpc3RcbiAgICAgICAgaWYgKCF1dGlsLmlzVW5kZWZpbmVkKGV4aXN0aW5nUGFpcikpIHtcbiAgICAgICAgICAgIHRoaXMucmVwbGFjZShleGlzdGluZ1BhaXIsIG5ld1BhaXIpO1xuICAgICAgICAgICAgcmV0dXJuIGV4aXN0aW5nUGFpci52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYXBwZW5kVG9UYWlsKG5ld1BhaXIpO1xuICAgICAgICAgICAgdGhpcy50YWJsZVtrXSA9IG5ld1BhaXI7XG4gICAgICAgICAgICArK3RoaXMubkVsZW1lbnRzO1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUga2V5cyBpbiB0aGlzIExpbmtlZERpY3Rpb25hcnksIG9yZGVyZWRcbiAgICAgKiBieSBpbnNlcnRpb24gb3JkZXIuXG4gICAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBrZXlzIGluIHRoaXMgTGlua2VkRGljdGlvbmFyeSxcbiAgICAgKiBvcmRlcmVkIGJ5IGluc2VydGlvbiBvcmRlci5cbiAgICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS5rZXlzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBhcnJheS5wdXNoKGtleSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSB2YWx1ZXMgaW4gdGhpcyBMaW5rZWREaWN0aW9uYXJ5LCBvcmRlcmVkIGJ5XG4gICAgICogaW5zZXJ0aW9uIG9yZGVyLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgdmFsdWVzIGluIHRoaXMgTGlua2VkRGljdGlvbmFyeSxcbiAgICAgKiBvcmRlcmVkIGJ5IGluc2VydGlvbiBvcmRlci5cbiAgICAgKi9cbiAgICBMaW5rZWREaWN0aW9uYXJ5LnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcnJheSA9IFtdO1xuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGFycmF5LnB1c2godmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2gga2V5LXZhbHVlIHBhaXJcbiAgICAgKiBwcmVzZW50IGluIHRoaXMgTGlua2VkRGljdGlvbmFyeS4gSXQgaXMgZG9uZSBpbiB0aGUgb3JkZXIgb2YgaW5zZXJ0aW9uXG4gICAgICogaW50byB0aGUgTGlua2VkRGljdGlvbmFyeVxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcbiAgICAgKiBpbnZva2VkIHdpdGggdHdvIGFyZ3VtZW50czoga2V5IGFuZCB2YWx1ZS4gVG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuXG4gICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgICovXG4gICAgTGlua2VkRGljdGlvbmFyeS5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgY3Jhd2xOb2RlID0gdGhpcy5oZWFkLm5leHQ7XG4gICAgICAgIHdoaWxlICghaXNIZWFkT3JUYWlsTGlua2VkRGljdGlvbmFyeVBhaXIoY3Jhd2xOb2RlKSkge1xuICAgICAgICAgICAgdmFyIHJldCA9IGNhbGxiYWNrKGNyYXdsTm9kZS5rZXksIGNyYXdsTm9kZS52YWx1ZSk7XG4gICAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNyYXdsTm9kZSA9IGNyYXdsTm9kZS5uZXh0O1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gTGlua2VkRGljdGlvbmFyeTtcbn0oRGljdGlvbmFyeV8xLmRlZmF1bHQpKTsgLy8gRW5kIG9mIExpbmtlZERpY3Rpb25hcnlcbmV4cG9ydHMuZGVmYXVsdCA9IExpbmtlZERpY3Rpb25hcnk7XG4vLyAvKipcbi8vICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgaXMgZXF1YWwgdG8gdGhlIGdpdmVuIGRpY3Rpb25hcnkuXG4vLyAgKiBUd28gZGljdGlvbmFyaWVzIGFyZSBlcXVhbCBpZiB0aGV5IGNvbnRhaW4gdGhlIHNhbWUgbWFwcGluZ3MuXG4vLyAgKiBAcGFyYW0ge2NvbGxlY3Rpb25zLkRpY3Rpb25hcnl9IG90aGVyIHRoZSBvdGhlciBkaWN0aW9uYXJ5LlxuLy8gICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gdmFsdWVzRXF1YWxGdW5jdGlvbiBvcHRpb25hbFxuLy8gICogZnVuY3Rpb24gdXNlZCB0byBjaGVjayBpZiB0d28gdmFsdWVzIGFyZSBlcXVhbC5cbi8vICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBkaWN0aW9uYXJ5IGlzIGVxdWFsIHRvIHRoZSBnaXZlbiBkaWN0aW9uYXJ5LlxuLy8gICovXG4vLyBjb2xsZWN0aW9ucy5EaWN0aW9uYXJ5LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihvdGhlcix2YWx1ZXNFcXVhbEZ1bmN0aW9uKSB7XG4vLyBcdGNvbnN0IGVxRiA9IHZhbHVlc0VxdWFsRnVuY3Rpb24gfHwgY29sbGVjdGlvbnMuZGVmYXVsdEVxdWFscztcbi8vIFx0aWYoIShvdGhlciBpbnN0YW5jZW9mIGNvbGxlY3Rpb25zLkRpY3Rpb25hcnkpKXtcbi8vIFx0XHRyZXR1cm4gZmFsc2U7XG4vLyBcdH1cbi8vIFx0aWYodGhpcy5zaXplKCkgIT09IG90aGVyLnNpemUoKSl7XG4vLyBcdFx0cmV0dXJuIGZhbHNlO1xuLy8gXHR9XG4vLyBcdHJldHVybiB0aGlzLmVxdWFsc0F1eCh0aGlzLmZpcnN0Tm9kZSxvdGhlci5maXJzdE5vZGUsZXFGKTtcbi8vIH1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPUxpbmtlZERpY3Rpb25hcnkuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIik7XG52YXIgYXJyYXlzID0gcmVxdWlyZShcIi4vYXJyYXlzXCIpO1xudmFyIExpbmtlZExpc3QgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBlbXB0eSBMaW5rZWQgTGlzdC5cbiAgICAgKiBAY2xhc3MgQSBsaW5rZWQgbGlzdCBpcyBhIGRhdGEgc3RydWN0dXJlIGNvbnNpc3Rpbmcgb2YgYSBncm91cCBvZiBub2Rlc1xuICAgICAqIHdoaWNoIHRvZ2V0aGVyIHJlcHJlc2VudCBhIHNlcXVlbmNlLlxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIExpbmtlZExpc3QoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJzdCBub2RlIGluIHRoZSBsaXN0XG4gICAgICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLmZpcnN0Tm9kZSA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMYXN0IG5vZGUgaW4gdGhlIGxpc3RcbiAgICAgICAgICogQHR5cGUge09iamVjdH1cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMubGFzdE5vZGUgPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogTnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoZSBsaXN0XG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICB0aGlzLm5FbGVtZW50cyA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gZWxlbWVudCB0byB0aGlzIGxpc3QuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gZWxlbWVudCB0byBiZSBhZGRlZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcj19IGluZGV4IG9wdGlvbmFsIGluZGV4IHRvIGFkZCB0aGUgZWxlbWVudC4gSWYgbm8gaW5kZXggaXMgc3BlY2lmaWVkXG4gICAgICogdGhlIGVsZW1lbnQgaXMgYWRkZWQgdG8gdGhlIGVuZCBvZiB0aGlzIGxpc3QuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZWxlbWVudCB3YXMgYWRkZWQgb3IgZmFsc2UgaWYgdGhlIGluZGV4IGlzIGludmFsaWRcbiAgICAgKiBvciBpZiB0aGUgZWxlbWVudCBpcyB1bmRlZmluZWQuXG4gICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGl0ZW0sIGluZGV4KSB7XG4gICAgICAgIGlmICh1dGlsLmlzVW5kZWZpbmVkKGluZGV4KSkge1xuICAgICAgICAgICAgaW5kZXggPSB0aGlzLm5FbGVtZW50cztcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID4gdGhpcy5uRWxlbWVudHMgfHwgdXRpbC5pc1VuZGVmaW5lZChpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZXdOb2RlID0gdGhpcy5jcmVhdGVOb2RlKGl0ZW0pO1xuICAgICAgICBpZiAodGhpcy5uRWxlbWVudHMgPT09IDAgfHwgdGhpcy5sYXN0Tm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgLy8gRmlyc3Qgbm9kZSBpbiB0aGUgbGlzdC5cbiAgICAgICAgICAgIHRoaXMuZmlyc3ROb2RlID0gbmV3Tm9kZTtcbiAgICAgICAgICAgIHRoaXMubGFzdE5vZGUgPSBuZXdOb2RlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGluZGV4ID09PSB0aGlzLm5FbGVtZW50cykge1xuICAgICAgICAgICAgLy8gSW5zZXJ0IGF0IHRoZSBlbmQuXG4gICAgICAgICAgICB0aGlzLmxhc3ROb2RlLm5leHQgPSBuZXdOb2RlO1xuICAgICAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IG5ld05vZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgIC8vIENoYW5nZSBmaXJzdCBub2RlLlxuICAgICAgICAgICAgbmV3Tm9kZS5uZXh0ID0gdGhpcy5maXJzdE5vZGU7XG4gICAgICAgICAgICB0aGlzLmZpcnN0Tm9kZSA9IG5ld05vZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgcHJldiA9IHRoaXMubm9kZUF0SW5kZXgoaW5kZXggLSAxKTtcbiAgICAgICAgICAgIGlmIChwcmV2ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbmV3Tm9kZS5uZXh0ID0gcHJldi5uZXh0O1xuICAgICAgICAgICAgcHJldi5uZXh0ID0gbmV3Tm9kZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5FbGVtZW50cysrO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhpcyBsaXN0LlxuICAgICAqIEByZXR1cm4geyp9IHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBsaXN0IG9yIHVuZGVmaW5lZCBpZiB0aGUgbGlzdCBpc1xuICAgICAqIGVtcHR5LlxuICAgICAqL1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLmZpcnN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5maXJzdE5vZGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpcnN0Tm9kZS5lbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBsYXN0IGVsZW1lbnQgaW4gdGhpcyBsaXN0LlxuICAgICAqIEByZXR1cm4geyp9IHRoZSBsYXN0IGVsZW1lbnQgaW4gdGhlIGxpc3Qgb3IgdW5kZWZpbmVkIGlmIHRoZSBsaXN0IGlzXG4gICAgICogZW1wdHkuXG4gICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMubGFzdE5vZGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxhc3ROb2RlLmVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGVsZW1lbnQgYXQgdGhlIHNwZWNpZmllZCBwb3NpdGlvbiBpbiB0aGlzIGxpc3QuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IGRlc2lyZWQgaW5kZXguXG4gICAgICogQHJldHVybiB7Kn0gdGhlIGVsZW1lbnQgYXQgdGhlIGdpdmVuIGluZGV4IG9yIHVuZGVmaW5lZCBpZiB0aGUgaW5kZXggaXNcbiAgICAgKiBvdXQgb2YgYm91bmRzLlxuICAgICAqL1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLmVsZW1lbnRBdEluZGV4ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlQXRJbmRleChpbmRleCk7XG4gICAgICAgIGlmIChub2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlLmVsZW1lbnQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpbmRleCBpbiB0aGlzIGxpc3Qgb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgdGhlXG4gICAgICogc3BlY2lmaWVkIGVsZW1lbnQsIG9yIC0xIGlmIHRoZSBMaXN0IGRvZXMgbm90IGNvbnRhaW4gdGhpcyBlbGVtZW50LlxuICAgICAqIDxwPklmIHRoZSBlbGVtZW50cyBpbnNpZGUgdGhpcyBsaXN0IGFyZVxuICAgICAqIG5vdCBjb21wYXJhYmxlIHdpdGggdGhlID09PSBvcGVyYXRvciBhIGN1c3RvbSBlcXVhbHMgZnVuY3Rpb24gc2hvdWxkIGJlXG4gICAgICogcHJvdmlkZWQgdG8gcGVyZm9ybSBzZWFyY2hlcywgdGhlIGZ1bmN0aW9uIG11c3QgcmVjZWl2ZSB0d28gYXJndW1lbnRzIGFuZFxuICAgICAqIHJldHVybiB0cnVlIGlmIHRoZXkgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuIEV4YW1wbGU6PC9wPlxuICAgICAqXG4gICAgICogPHByZT5cbiAgICAgKiBjb25zdCBwZXRzQXJlRXF1YWxCeU5hbWUgPSBmdW5jdGlvbihwZXQxLCBwZXQyKSB7XG4gICAgICogIHJldHVybiBwZXQxLm5hbWUgPT09IHBldDIubmFtZTtcbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gZWxlbWVudCB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIE9wdGlvbmFsXG4gICAgICogZnVuY3Rpb24gdXNlZCB0byBjaGVjayBpZiB0d28gZWxlbWVudHMgYXJlIGVxdWFsLlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIGluZGV4IGluIHRoaXMgbGlzdCBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZVxuICAgICAqIG9mIHRoZSBzcGVjaWZpZWQgZWxlbWVudCwgb3IgLTEgaWYgdGhpcyBsaXN0IGRvZXMgbm90IGNvbnRhaW4gdGhlXG4gICAgICogZWxlbWVudC5cbiAgICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gKGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSB7XG4gICAgICAgIHZhciBlcXVhbHNGID0gZXF1YWxzRnVuY3Rpb24gfHwgdXRpbC5kZWZhdWx0RXF1YWxzO1xuICAgICAgICBpZiAodXRpbC5pc1VuZGVmaW5lZChpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjdXJyZW50Tm9kZSA9IHRoaXMuZmlyc3ROb2RlO1xuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICB3aGlsZSAoY3VycmVudE5vZGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChlcXVhbHNGKGN1cnJlbnROb2RlLmVsZW1lbnQsIGl0ZW0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBsaXN0IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKiA8cD5JZiB0aGUgZWxlbWVudHMgaW5zaWRlIHRoZSBsaXN0IGFyZVxuICAgICAqIG5vdCBjb21wYXJhYmxlIHdpdGggdGhlID09PSBvcGVyYXRvciBhIGN1c3RvbSBlcXVhbHMgZnVuY3Rpb24gc2hvdWxkIGJlXG4gICAgICogcHJvdmlkZWQgdG8gcGVyZm9ybSBzZWFyY2hlcywgdGhlIGZ1bmN0aW9uIG11c3QgcmVjZWl2ZSB0d28gYXJndW1lbnRzIGFuZFxuICAgICAqIHJldHVybiB0cnVlIGlmIHRoZXkgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuIEV4YW1wbGU6PC9wPlxuICAgICAqXG4gICAgICogPHByZT5cbiAgICAgKiBjb25zdCBwZXRzQXJlRXF1YWxCeU5hbWUgPSBmdW5jdGlvbihwZXQxLCBwZXQyKSB7XG4gICAgICogIHJldHVybiBwZXQxLm5hbWUgPT09IHBldDIubmFtZTtcbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gZWxlbWVudCB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIE9wdGlvbmFsXG4gICAgICogZnVuY3Rpb24gdXNlZCB0byBjaGVjayBpZiB0d28gZWxlbWVudHMgYXJlIGVxdWFsLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBsaXN0IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudCwgZmFsc2VcbiAgICAgKiBvdGhlcndpc2UuXG4gICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoaXRlbSwgZXF1YWxzRnVuY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmluZGV4T2YoaXRlbSwgZXF1YWxzRnVuY3Rpb24pID49IDApO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaW4gdGhpcyBsaXN0LlxuICAgICAqIDxwPklmIHRoZSBlbGVtZW50cyBpbnNpZGUgdGhlIGxpc3QgYXJlXG4gICAgICogbm90IGNvbXBhcmFibGUgd2l0aCB0aGUgPT09IG9wZXJhdG9yIGEgY3VzdG9tIGVxdWFscyBmdW5jdGlvbiBzaG91bGQgYmVcbiAgICAgKiBwcm92aWRlZCB0byBwZXJmb3JtIHNlYXJjaGVzLCB0aGUgZnVuY3Rpb24gbXVzdCByZWNlaXZlIHR3byBhcmd1bWVudHMgYW5kXG4gICAgICogcmV0dXJuIHRydWUgaWYgdGhleSBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS4gRXhhbXBsZTo8L3A+XG4gICAgICpcbiAgICAgKiA8cHJlPlxuICAgICAqIGNvbnN0IHBldHNBcmVFcXVhbEJ5TmFtZSA9IGZ1bmN0aW9uKHBldDEsIHBldDIpIHtcbiAgICAgKiAgcmV0dXJuIHBldDEubmFtZSA9PT0gcGV0Mi5uYW1lO1xuICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaXRlbSBlbGVtZW50IHRvIGJlIHJlbW92ZWQgZnJvbSB0aGlzIGxpc3QsIGlmIHByZXNlbnQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgbGlzdCBjb250YWluZWQgdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuICAgICAqL1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChpdGVtLCBlcXVhbHNGdW5jdGlvbikge1xuICAgICAgICB2YXIgZXF1YWxzRiA9IGVxdWFsc0Z1bmN0aW9uIHx8IHV0aWwuZGVmYXVsdEVxdWFscztcbiAgICAgICAgaWYgKHRoaXMubkVsZW1lbnRzIDwgMSB8fCB1dGlsLmlzVW5kZWZpbmVkKGl0ZW0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHByZXZpb3VzID0gbnVsbDtcbiAgICAgICAgdmFyIGN1cnJlbnROb2RlID0gdGhpcy5maXJzdE5vZGU7XG4gICAgICAgIHdoaWxlIChjdXJyZW50Tm9kZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKGVxdWFsc0YoY3VycmVudE5vZGUuZWxlbWVudCwgaXRlbSkpIHtcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maXJzdE5vZGUgPSBjdXJyZW50Tm9kZS5uZXh0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3VycmVudE5vZGUgPT09IHRoaXMubGFzdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdE5vZGUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGN1cnJlbnROb2RlID09PSB0aGlzLmxhc3ROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdE5vZGUgPSBwcmV2aW91cztcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXMubmV4dCA9IGN1cnJlbnROb2RlLm5leHQ7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlLm5leHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXMubmV4dCA9IGN1cnJlbnROb2RlLm5leHQ7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlLm5leHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm5FbGVtZW50cy0tO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJldmlvdXMgPSBjdXJyZW50Tm9kZTtcbiAgICAgICAgICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgZWxlbWVudHMgZnJvbSB0aGlzIGxpc3QuXG4gICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZmlyc3ROb2RlID0gbnVsbDtcbiAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IG51bGw7XG4gICAgICAgIHRoaXMubkVsZW1lbnRzID0gMDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGxpc3QgaXMgZXF1YWwgdG8gdGhlIGdpdmVuIGxpc3QuXG4gICAgICogVHdvIGxpc3RzIGFyZSBlcXVhbCBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgb3JkZXIuXG4gICAgICogQHBhcmFtIHtMaW5rZWRMaXN0fSBvdGhlciB0aGUgb3RoZXIgbGlzdC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOmJvb2xlYW49fSBlcXVhbHNGdW5jdGlvbiBvcHRpb25hbFxuICAgICAqIGZ1bmN0aW9uIHVzZWQgdG8gY2hlY2sgaWYgdHdvIGVsZW1lbnRzIGFyZSBlcXVhbC4gSWYgdGhlIGVsZW1lbnRzIGluIHRoZSBsaXN0c1xuICAgICAqIGFyZSBjdXN0b20gb2JqZWN0cyB5b3Ugc2hvdWxkIHByb3ZpZGUgYSBmdW5jdGlvbiwgb3RoZXJ3aXNlXG4gICAgICogdGhlID09PSBvcGVyYXRvciBpcyB1c2VkIHRvIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gZWxlbWVudHMuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIGxpc3QgaXMgZXF1YWwgdG8gdGhlIGdpdmVuIGxpc3QuXG4gICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gKG90aGVyLCBlcXVhbHNGdW5jdGlvbikge1xuICAgICAgICB2YXIgZXFGID0gZXF1YWxzRnVuY3Rpb24gfHwgdXRpbC5kZWZhdWx0RXF1YWxzO1xuICAgICAgICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIExpbmtlZExpc3QpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2l6ZSgpICE9PSBvdGhlci5zaXplKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5lcXVhbHNBdXgodGhpcy5maXJzdE5vZGUsIG90aGVyLmZpcnN0Tm9kZSwgZXFGKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuZXF1YWxzQXV4ID0gZnVuY3Rpb24gKG4xLCBuMiwgZXFGKSB7XG4gICAgICAgIHdoaWxlIChuMSAhPT0gbnVsbCAmJiBuMiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKCFlcUYobjEuZWxlbWVudCwgbjIuZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBuMSA9IG4xLm5leHQ7XG4gICAgICAgICAgICBuMiA9IG4yLm5leHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBlbGVtZW50IGF0IHRoZSBzcGVjaWZpZWQgcG9zaXRpb24gaW4gdGhpcyBsaXN0LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCBnaXZlbiBpbmRleC5cbiAgICAgKiBAcmV0dXJuIHsqfSByZW1vdmVkIGVsZW1lbnQgb3IgdW5kZWZpbmVkIGlmIHRoZSBpbmRleCBpcyBvdXQgb2YgYm91bmRzLlxuICAgICAqL1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLnJlbW92ZUVsZW1lbnRBdEluZGV4ID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgIGlmIChpbmRleCA8IDAgfHwgaW5kZXggPj0gdGhpcy5uRWxlbWVudHMgfHwgdGhpcy5maXJzdE5vZGUgPT09IG51bGwgfHwgdGhpcy5sYXN0Tm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZWxlbWVudDtcbiAgICAgICAgaWYgKHRoaXMubkVsZW1lbnRzID09PSAxKSB7XG4gICAgICAgICAgICAvL0ZpcnN0IG5vZGUgaW4gdGhlIGxpc3QuXG4gICAgICAgICAgICBlbGVtZW50ID0gdGhpcy5maXJzdE5vZGUuZWxlbWVudDtcbiAgICAgICAgICAgIHRoaXMuZmlyc3ROb2RlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMubGFzdE5vZGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHByZXZpb3VzID0gdGhpcy5ub2RlQXRJbmRleChpbmRleCAtIDEpO1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9IHRoaXMuZmlyc3ROb2RlLmVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5maXJzdE5vZGUgPSB0aGlzLmZpcnN0Tm9kZS5uZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocHJldmlvdXMubmV4dCA9PT0gdGhpcy5sYXN0Tm9kZSkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSB0aGlzLmxhc3ROb2RlLmVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IHByZXZpb3VzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByZXZpb3VzICE9PSBudWxsICYmIHByZXZpb3VzLm5leHQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gcHJldmlvdXMubmV4dC5lbGVtZW50O1xuICAgICAgICAgICAgICAgIHByZXZpb3VzLm5leHQgPSBwcmV2aW91cy5uZXh0Lm5leHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uRWxlbWVudHMtLTtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyBsaXN0IGluIG9yZGVyLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xuICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW5cbiAgICAgKiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cbiAgICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjdXJyZW50Tm9kZSA9IHRoaXMuZmlyc3ROb2RlO1xuICAgICAgICB3aGlsZSAoY3VycmVudE5vZGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayhjdXJyZW50Tm9kZS5lbGVtZW50KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV2ZXJzZXMgdGhlIG9yZGVyIG9mIHRoZSBlbGVtZW50cyBpbiB0aGlzIGxpbmtlZCBsaXN0IChtYWtlcyB0aGUgbGFzdFxuICAgICAqIGVsZW1lbnQgZmlyc3QsIGFuZCB0aGUgZmlyc3QgZWxlbWVudCBsYXN0KS5cbiAgICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5yZXZlcnNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcHJldmlvdXMgPSBudWxsO1xuICAgICAgICB2YXIgY3VycmVudCA9IHRoaXMuZmlyc3ROb2RlO1xuICAgICAgICB2YXIgdGVtcCA9IG51bGw7XG4gICAgICAgIHdoaWxlIChjdXJyZW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICB0ZW1wID0gY3VycmVudC5uZXh0O1xuICAgICAgICAgICAgY3VycmVudC5uZXh0ID0gcHJldmlvdXM7XG4gICAgICAgICAgICBwcmV2aW91cyA9IGN1cnJlbnQ7XG4gICAgICAgICAgICBjdXJyZW50ID0gdGVtcDtcbiAgICAgICAgfVxuICAgICAgICB0ZW1wID0gdGhpcy5maXJzdE5vZGU7XG4gICAgICAgIHRoaXMuZmlyc3ROb2RlID0gdGhpcy5sYXN0Tm9kZTtcbiAgICAgICAgdGhpcy5sYXN0Tm9kZSA9IHRlbXA7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBlbGVtZW50cyBpbiB0aGlzIGxpc3QgaW4gcHJvcGVyXG4gICAgICogc2VxdWVuY2UuXG4gICAgICogQHJldHVybiB7QXJyYXkuPCo+fSBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgZWxlbWVudHMgaW4gdGhpcyBsaXN0LFxuICAgICAqIGluIHByb3BlciBzZXF1ZW5jZS5cbiAgICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJyYXkgPSBbXTtcbiAgICAgICAgdmFyIGN1cnJlbnROb2RlID0gdGhpcy5maXJzdE5vZGU7XG4gICAgICAgIHdoaWxlIChjdXJyZW50Tm9kZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgYXJyYXkucHVzaChjdXJyZW50Tm9kZS5lbGVtZW50KTtcbiAgICAgICAgICAgIGN1cnJlbnROb2RlID0gY3VycmVudE5vZGUubmV4dDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBsaXN0LlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIGxpc3QuXG4gICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubkVsZW1lbnRzO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgbGlzdCBjb250YWlucyBubyBlbGVtZW50cy5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgbGlzdCBjb250YWlucyBubyBlbGVtZW50cy5cbiAgICAgKi9cbiAgICBMaW5rZWRMaXN0LnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5uRWxlbWVudHMgPD0gMDtcbiAgICB9O1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gYXJyYXlzLnRvU3RyaW5nKHRoaXMudG9BcnJheSgpKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICovXG4gICAgTGlua2VkTGlzdC5wcm90b3R5cGUubm9kZUF0SW5kZXggPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMCB8fCBpbmRleCA+PSB0aGlzLm5FbGVtZW50cykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGV4ID09PSAodGhpcy5uRWxlbWVudHMgLSAxKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFzdE5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmZpcnN0Tm9kZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmRleCAmJiBub2RlICE9PSBudWxsOyBpKyspIHtcbiAgICAgICAgICAgIG5vZGUgPSBub2RlLm5leHQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIExpbmtlZExpc3QucHJvdG90eXBlLmNyZWF0ZU5vZGUgPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZWxlbWVudDogaXRlbSxcbiAgICAgICAgICAgIG5leHQ6IG51bGxcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHJldHVybiBMaW5rZWRMaXN0O1xufSgpKTsgLy8gRW5kIG9mIGxpbmtlZCBsaXN0XG5leHBvcnRzLmRlZmF1bHQgPSBMaW5rZWRMaXN0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9TGlua2VkTGlzdC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbnZhciBEaWN0aW9uYXJ5XzEgPSByZXF1aXJlKFwiLi9EaWN0aW9uYXJ5XCIpO1xudmFyIGFycmF5cyA9IHJlcXVpcmUoXCIuL2FycmF5c1wiKTtcbnZhciBNdWx0aURpY3Rpb25hcnkgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBlbXB0eSBtdWx0aSBkaWN0aW9uYXJ5LlxuICAgICAqIEBjbGFzcyA8cD5BIG11bHRpIGRpY3Rpb25hcnkgaXMgYSBzcGVjaWFsIGtpbmQgb2YgZGljdGlvbmFyeSB0aGF0IGhvbGRzXG4gICAgICogbXVsdGlwbGUgdmFsdWVzIGFnYWluc3QgZWFjaCBrZXkuIFNldHRpbmcgYSB2YWx1ZSBpbnRvIHRoZSBkaWN0aW9uYXJ5IHdpbGxcbiAgICAgKiBhZGQgdGhlIHZhbHVlIHRvIGFuIGFycmF5IGF0IHRoYXQga2V5LiBHZXR0aW5nIGEga2V5IHdpbGwgcmV0dXJuIGFuIGFycmF5LFxuICAgICAqIGhvbGRpbmcgYWxsIHRoZSB2YWx1ZXMgc2V0IHRvIHRoYXQga2V5LlxuICAgICAqIFlvdSBjYW4gY29uZmlndXJlIHRvIGFsbG93IGR1cGxpY2F0ZXMgaW4gdGhlIHZhbHVlcy5cbiAgICAgKiBUaGlzIGltcGxlbWVudGF0aW9uIGFjY2VwdHMgYW55IGtpbmQgb2Ygb2JqZWN0cyBhcyBrZXlzLjwvcD5cbiAgICAgKlxuICAgICAqIDxwPklmIHRoZSBrZXlzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGZ1bmN0aW9uIHdoaWNoIGNvbnZlcnRzIGtleXMgdG8gc3RyaW5ncyBtdXN0IGJlXG4gICAgICogcHJvdmlkZWQuIEV4YW1wbGU6PC9wPlxuICAgICAqXG4gICAgICogPHByZT5cbiAgICAgKiBmdW5jdGlvbiBwZXRUb1N0cmluZyhwZXQpIHtcbiAgICAgKiAgICAgcmV0dXJuIHBldC5uYW1lO1xuICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKiA8cD5JZiB0aGUgdmFsdWVzIGFyZSBjdXN0b20gb2JqZWN0cyBhIGZ1bmN0aW9uIHRvIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gdmFsdWVzXG4gICAgICogbXVzdCBiZSBwcm92aWRlZC4gRXhhbXBsZTo8L3A+XG4gICAgICpcbiAgICAgKiA8cHJlPlxuICAgICAqIGZ1bmN0aW9uIHBldHNBcmVFcXVhbEJ5QWdlKHBldDEscGV0Mikge1xuICAgICAqICAgICByZXR1cm4gcGV0MS5hZ2UgPT09IHBldDIuYWdlO1xuICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6c3RyaW5nPX0gdG9TdHJGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvblxuICAgICAqIHRvIGNvbnZlcnQga2V5cyB0byBzdHJpbmdzLiBJZiB0aGUga2V5cyBhcmVuJ3Qgc3RyaW5ncyBvciBpZiB0b1N0cmluZygpXG4gICAgICogaXMgbm90IGFwcHJvcHJpYXRlLCBhIGN1c3RvbSBmdW5jdGlvbiB3aGljaCByZWNlaXZlcyBhIGtleSBhbmQgcmV0dXJucyBhXG4gICAgICogdW5pcXVlIHN0cmluZyBtdXN0IGJlIHByb3ZpZGVkLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IHZhbHVlc0VxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsXG4gICAgICogZnVuY3Rpb24gdG8gY2hlY2sgaWYgdHdvIHZhbHVlcyBhcmUgZXF1YWwuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYWxsb3dEdXBsaWNhdGVWYWx1ZXNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBNdWx0aURpY3Rpb25hcnkodG9TdHJGdW5jdGlvbiwgdmFsdWVzRXF1YWxzRnVuY3Rpb24sIGFsbG93RHVwbGljYXRlVmFsdWVzKSB7XG4gICAgICAgIGlmIChhbGxvd0R1cGxpY2F0ZVZhbHVlcyA9PT0gdm9pZCAwKSB7IGFsbG93RHVwbGljYXRlVmFsdWVzID0gZmFsc2U7IH1cbiAgICAgICAgdGhpcy5kaWN0ID0gbmV3IERpY3Rpb25hcnlfMS5kZWZhdWx0KHRvU3RyRnVuY3Rpb24pO1xuICAgICAgICB0aGlzLmVxdWFsc0YgPSB2YWx1ZXNFcXVhbHNGdW5jdGlvbiB8fCB1dGlsLmRlZmF1bHRFcXVhbHM7XG4gICAgICAgIHRoaXMuYWxsb3dEdXBsaWNhdGUgPSBhbGxvd0R1cGxpY2F0ZVZhbHVlcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBob2xkaW5nIHRoZSB2YWx1ZXMgdG8gd2hpY2ggdGhpcyBkaWN0aW9uYXJ5IG1hcHNcbiAgICAgKiB0aGUgc3BlY2lmaWVkIGtleS5cbiAgICAgKiBSZXR1cm5zIGFuIGVtcHR5IGFycmF5IGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBubyBtYXBwaW5ncyBmb3IgdGhpcyBrZXkuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGtleSBrZXkgd2hvc2UgYXNzb2NpYXRlZCB2YWx1ZXMgYXJlIHRvIGJlIHJldHVybmVkLlxuICAgICAqIEByZXR1cm4ge0FycmF5fSBhbiBhcnJheSBob2xkaW5nIHRoZSB2YWx1ZXMgdG8gd2hpY2ggdGhpcyBkaWN0aW9uYXJ5IG1hcHNcbiAgICAgKiB0aGUgc3BlY2lmaWVkIGtleS5cbiAgICAgKi9cbiAgICBNdWx0aURpY3Rpb25hcnkucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICB2YXIgdmFsdWVzID0gdGhpcy5kaWN0LmdldFZhbHVlKGtleSk7XG4gICAgICAgIGlmICh1dGlsLmlzVW5kZWZpbmVkKHZhbHVlcykpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyYXlzLmNvcHkodmFsdWVzKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEFkZHMgdGhlIHZhbHVlIHRvIHRoZSBhcnJheSBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXksIGlmXG4gICAgICogaXQgaXMgbm90IGFscmVhZHkgcHJlc2VudC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5IGtleSB3aXRoIHdoaWNoIHRoZSBzcGVjaWZpZWQgdmFsdWUgaXMgdG8gYmVcbiAgICAgKiBhc3NvY2lhdGVkLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZSB0aGUgdmFsdWUgdG8gYWRkIHRvIHRoZSBhcnJheSBhdCB0aGUga2V5XG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgdmFsdWUgd2FzIG5vdCBhbHJlYWR5IGFzc29jaWF0ZWQgd2l0aCB0aGF0IGtleS5cbiAgICAgKi9cbiAgICBNdWx0aURpY3Rpb25hcnkucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNVbmRlZmluZWQoa2V5KSB8fCB1dGlsLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhcnJheSA9IHRoaXMuZGljdC5nZXRWYWx1ZShrZXkpO1xuICAgICAgICBpZiAodXRpbC5pc1VuZGVmaW5lZChhcnJheSkpIHtcbiAgICAgICAgICAgIHRoaXMuZGljdC5zZXRWYWx1ZShrZXksIFt2YWx1ZV0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmFsbG93RHVwbGljYXRlKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXlzLmNvbnRhaW5zKGFycmF5LCB2YWx1ZSwgdGhpcy5lcXVhbHNGKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhcnJheS5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgdmFsdWVzIGZyb20gdGhlIGFycmF5IG9mIHZhbHVlcyBhc3NvY2lhdGVkIHdpdGggdGhlXG4gICAgICogc3BlY2lmaWVkIGtleS4gSWYgYSB2YWx1ZSBpc24ndCBnaXZlbiwgYWxsIHZhbHVlcyBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZFxuICAgICAqIGtleSBhcmUgcmVtb3ZlZC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0ga2V5IGtleSB3aG9zZSBtYXBwaW5nIGlzIHRvIGJlIHJlbW92ZWQgZnJvbSB0aGVcbiAgICAgKiBkaWN0aW9uYXJ5LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0PX0gdmFsdWUgb3B0aW9uYWwgYXJndW1lbnQgdG8gc3BlY2lmeSB0aGUgdmFsdWUgdG8gcmVtb3ZlXG4gICAgICogZnJvbSB0aGUgYXJyYXkgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQga2V5LlxuICAgICAqIEByZXR1cm4geyp9IHRydWUgaWYgdGhlIGRpY3Rpb25hcnkgY2hhbmdlZCwgZmFsc2UgaWYgdGhlIGtleSBkb2Vzbid0IGV4aXN0IG9yXG4gICAgICogaWYgdGhlIHNwZWNpZmllZCB2YWx1ZSBpc24ndCBhc3NvY2lhdGVkIHdpdGggdGhlIHNwZWNpZmllZCBrZXkuXG4gICAgICovXG4gICAgTXVsdGlEaWN0aW9uYXJ5LnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodXRpbC5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhciB2ID0gdGhpcy5kaWN0LnJlbW92ZShrZXkpO1xuICAgICAgICAgICAgcmV0dXJuICF1dGlsLmlzVW5kZWZpbmVkKHYpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhcnJheSA9IHRoaXMuZGljdC5nZXRWYWx1ZShrZXkpO1xuICAgICAgICBpZiAoIXV0aWwuaXNVbmRlZmluZWQoYXJyYXkpICYmIGFycmF5cy5yZW1vdmUoYXJyYXksIHZhbHVlLCB0aGlzLmVxdWFsc0YpKSB7XG4gICAgICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kaWN0LnJlbW92ZShrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUga2V5cyBpbiB0aGlzIGRpY3Rpb25hcnkuXG4gICAgICogQHJldHVybiB7QXJyYXl9IGFuIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBrZXlzIGluIHRoaXMgZGljdGlvbmFyeS5cbiAgICAgKi9cbiAgICBNdWx0aURpY3Rpb25hcnkucHJvdG90eXBlLmtleXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpY3Qua2V5cygpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGUgdmFsdWVzIGluIHRoaXMgZGljdGlvbmFyeS5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIHZhbHVlcyBpbiB0aGlzIGRpY3Rpb25hcnkuXG4gICAgICovXG4gICAgTXVsdGlEaWN0aW9uYXJ5LnByb3RvdHlwZS52YWx1ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSB0aGlzLmRpY3QudmFsdWVzKCk7XG4gICAgICAgIHZhciBhcnJheSA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHZhbHVlc18xID0gdmFsdWVzOyBfaSA8IHZhbHVlc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIHYgPSB2YWx1ZXNfMVtfaV07XG4gICAgICAgICAgICBmb3IgKHZhciBfYSA9IDAsIHZfMSA9IHY7IF9hIDwgdl8xLmxlbmd0aDsgX2ErKykge1xuICAgICAgICAgICAgICAgIHZhciB3ID0gdl8xW19hXTtcbiAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGRpY3Rpb25hcnkgYXQgbGVhc3Qgb25lIHZhbHVlIGFzc29jaWF0dGVkIHRoZSBzcGVjaWZpZWQga2V5LlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBrZXkga2V5IHdob3NlIHByZXNlbmNlIGluIHRoaXMgZGljdGlvbmFyeSBpcyB0byBiZVxuICAgICAqIHRlc3RlZC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBhdCBsZWFzdCBvbmUgdmFsdWUgYXNzb2NpYXR0ZWRcbiAgICAgKiB0aGUgc3BlY2lmaWVkIGtleS5cbiAgICAgKi9cbiAgICBNdWx0aURpY3Rpb25hcnkucHJvdG90eXBlLmNvbnRhaW5zS2V5ID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaWN0LmNvbnRhaW5zS2V5KGtleSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBtYXBwaW5ncyBmcm9tIHRoaXMgZGljdGlvbmFyeS5cbiAgICAgKi9cbiAgICBNdWx0aURpY3Rpb25hcnkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmRpY3QuY2xlYXIoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBrZXlzIGluIHRoaXMgZGljdGlvbmFyeS5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2Yga2V5LXZhbHVlIG1hcHBpbmdzIGluIHRoaXMgZGljdGlvbmFyeS5cbiAgICAgKi9cbiAgICBNdWx0aURpY3Rpb25hcnkucHJvdG90eXBlLnNpemUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpY3Quc2l6ZSgpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBubyBtYXBwaW5ncy5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgZGljdGlvbmFyeSBjb250YWlucyBubyBtYXBwaW5ncy5cbiAgICAgKi9cbiAgICBNdWx0aURpY3Rpb25hcnkucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpY3QuaXNFbXB0eSgpO1xuICAgIH07XG4gICAgcmV0dXJuIE11bHRpRGljdGlvbmFyeTtcbn0oKSk7IC8vIGVuZCBvZiBtdWx0aSBkaWN0aW9uYXJ5XG5leHBvcnRzLmRlZmF1bHQgPSBNdWx0aURpY3Rpb25hcnk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1NdWx0aURpY3Rpb25hcnkuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgRGlyZWN0aW9uO1xuKGZ1bmN0aW9uIChEaXJlY3Rpb24pIHtcbiAgICBEaXJlY3Rpb25bRGlyZWN0aW9uW1wiQkVGT1JFXCJdID0gMF0gPSBcIkJFRk9SRVwiO1xuICAgIERpcmVjdGlvbltEaXJlY3Rpb25bXCJBRlRFUlwiXSA9IDFdID0gXCJBRlRFUlwiO1xuICAgIERpcmVjdGlvbltEaXJlY3Rpb25bXCJJTlNJREVfQVRfRU5EXCJdID0gMl0gPSBcIklOU0lERV9BVF9FTkRcIjtcbiAgICBEaXJlY3Rpb25bRGlyZWN0aW9uW1wiSU5TSURFX0FUX1NUQVJUXCJdID0gM10gPSBcIklOU0lERV9BVF9TVEFSVFwiO1xufSkoRGlyZWN0aW9uIHx8IChEaXJlY3Rpb24gPSB7fSkpO1xudmFyIE11bHRpUm9vdFRyZWUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTXVsdGlSb290VHJlZShyb290SWRzLCBub2Rlcykge1xuICAgICAgICBpZiAocm9vdElkcyA9PT0gdm9pZCAwKSB7IHJvb3RJZHMgPSBbXTsgfVxuICAgICAgICBpZiAobm9kZXMgPT09IHZvaWQgMCkgeyBub2RlcyA9IHt9OyB9XG4gICAgICAgIHRoaXMucm9vdElkcyA9IHJvb3RJZHM7XG4gICAgICAgIHRoaXMubm9kZXMgPSBub2RlcztcbiAgICAgICAgdGhpcy5pbml0Um9vdElkcygpO1xuICAgICAgICB0aGlzLmluaXROb2RlcygpO1xuICAgIH1cbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5pbml0Um9vdElkcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMucm9vdElkczsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciByb290SWQgPSBfYVtfaV07XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUVtcHR5Tm9kZUlmTm90RXhpc3Qocm9vdElkKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuaW5pdE5vZGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBub2RlS2V5IGluIHRoaXMubm9kZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGVzLmhhc093blByb3BlcnR5KG5vZGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IHRoaXMubm9kZXNbbm9kZUtleV07IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlTGlzdEl0ZW0gPSBfYVtfaV07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlRW1wdHlOb2RlSWZOb3RFeGlzdChub2RlTGlzdEl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuY3JlYXRlRW1wdHlOb2RlSWZOb3RFeGlzdCA9IGZ1bmN0aW9uIChub2RlS2V5KSB7XG4gICAgICAgIGlmICghdGhpcy5ub2Rlc1tub2RlS2V5XSkge1xuICAgICAgICAgICAgdGhpcy5ub2Rlc1tub2RlS2V5XSA9IFtdO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5nZXRSb290SWRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2xvbmUgPSB0aGlzLnJvb3RJZHMuc2xpY2UoKTtcbiAgICAgICAgcmV0dXJuIGNsb25lO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuZ2V0Tm9kZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjbG9uZSA9IHt9O1xuICAgICAgICBmb3IgKHZhciBub2RlS2V5IGluIHRoaXMubm9kZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGVzLmhhc093blByb3BlcnR5KG5vZGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgY2xvbmVbbm9kZUtleV0gPSB0aGlzLm5vZGVzW25vZGVLZXldLnNsaWNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNsb25lO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuZ2V0T2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcm9vdElkczogdGhpcy5nZXRSb290SWRzKCksXG4gICAgICAgICAgICBub2RlczogdGhpcy5nZXROb2RlcygpLFxuICAgICAgICB9O1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUudG9PYmplY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldE9iamVjdCgpO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuZmxhdHRlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIGV4dHJhUHJvcHNPYmplY3QgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJvb3RJZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciByb290SWQgPSB0aGlzLnJvb3RJZHNbaV07XG4gICAgICAgICAgICBleHRyYVByb3BzT2JqZWN0LnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiByb290SWQsXG4gICAgICAgICAgICAgICAgbGV2ZWw6IDAsXG4gICAgICAgICAgICAgICAgaGFzUGFyZW50OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbkNvdW50OiAwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cmF2ZXJzZShyb290SWQsIHRoaXMubm9kZXMsIGV4dHJhUHJvcHNPYmplY3QsIDApO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgZXh0cmFQcm9wc09iamVjdF8xID0gZXh0cmFQcm9wc09iamVjdDsgX2kgPCBleHRyYVByb3BzT2JqZWN0XzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgbyA9IGV4dHJhUHJvcHNPYmplY3RfMVtfaV07XG4gICAgICAgICAgICBvLmNoaWxkcmVuQ291bnQgPSBjb3VudENoaWxkcmVuKG8uaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleHRyYVByb3BzT2JqZWN0O1xuICAgICAgICBmdW5jdGlvbiBjb3VudENoaWxkcmVuKGlkKSB7XG4gICAgICAgICAgICBpZiAoIV90aGlzLm5vZGVzW2lkXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuQ291bnQgPSBfdGhpcy5ub2Rlc1tpZF0ubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZHJlbkNvdW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHRyYXZlcnNlKHN0YXJ0SWQsIG5vZGVzLCByZXR1cm5BcnJheSwgbGV2ZWwpIHtcbiAgICAgICAgICAgIGlmIChsZXZlbCA9PT0gdm9pZCAwKSB7IGxldmVsID0gMDsgfVxuICAgICAgICAgICAgaWYgKCFzdGFydElkIHx8ICFub2RlcyB8fCAhcmV0dXJuQXJyYXkgfHwgIW5vZGVzW3N0YXJ0SWRdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV2ZWwrKztcbiAgICAgICAgICAgIHZhciBpZHNMaXN0ID0gbm9kZXNbc3RhcnRJZF07XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlkc0xpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaWQgPSBpZHNMaXN0W2ldO1xuICAgICAgICAgICAgICAgIHJldHVybkFycmF5LnB1c2goeyBpZDogaWQsIGxldmVsOiBsZXZlbCwgaGFzUGFyZW50OiB0cnVlIH0pO1xuICAgICAgICAgICAgICAgIHRyYXZlcnNlKGlkLCBub2RlcywgcmV0dXJuQXJyYXksIGxldmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldmVsLS07XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLm1vdmVJZEJlZm9yZUlkID0gZnVuY3Rpb24gKG1vdmVJZCwgYmVmb3JlSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW92ZUlkKG1vdmVJZCwgYmVmb3JlSWQsIERpcmVjdGlvbi5CRUZPUkUpO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUubW92ZUlkQWZ0ZXJJZCA9IGZ1bmN0aW9uIChtb3ZlSWQsIGFmdGVySWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubW92ZUlkKG1vdmVJZCwgYWZ0ZXJJZCwgRGlyZWN0aW9uLkFGVEVSKTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLm1vdmVJZEludG9JZCA9IGZ1bmN0aW9uIChtb3ZlSWQsIGluc2lkZUlkLCBhdFN0YXJ0KSB7XG4gICAgICAgIGlmIChhdFN0YXJ0ID09PSB2b2lkIDApIHsgYXRTdGFydCA9IHRydWU7IH1cbiAgICAgICAgaWYgKGF0U3RhcnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdmVJZChtb3ZlSWQsIGluc2lkZUlkLCBEaXJlY3Rpb24uSU5TSURFX0FUX1NUQVJUKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLm1vdmVJZChtb3ZlSWQsIGluc2lkZUlkLCBEaXJlY3Rpb24uSU5TSURFX0FUX0VORCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLnN3YXBSb290SWRXaXRoUm9vdElkID0gZnVuY3Rpb24gKHJvb3RJZCwgd2l0aFJvb3RJZCkge1xuICAgICAgICB2YXIgbGVmdEluZGV4ID0gdGhpcy5maW5kUm9vdElkKHJvb3RJZCk7XG4gICAgICAgIHZhciByaWdodEluZGV4ID0gdGhpcy5maW5kUm9vdElkKHdpdGhSb290SWQpO1xuICAgICAgICB0aGlzLnN3YXBSb290UG9zaXRpb25XaXRoUm9vdFBvc2l0aW9uKGxlZnRJbmRleCwgcmlnaHRJbmRleCk7XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5zd2FwUm9vdFBvc2l0aW9uV2l0aFJvb3RQb3NpdGlvbiA9IGZ1bmN0aW9uIChzd2FwUm9vdFBvc2l0aW9uLCB3aXRoUm9vdFBvc2l0aW9uKSB7XG4gICAgICAgIHZhciB0ZW1wID0gdGhpcy5yb290SWRzW3dpdGhSb290UG9zaXRpb25dO1xuICAgICAgICB0aGlzLnJvb3RJZHNbd2l0aFJvb3RQb3NpdGlvbl0gPSB0aGlzLnJvb3RJZHNbc3dhcFJvb3RQb3NpdGlvbl07XG4gICAgICAgIHRoaXMucm9vdElkc1tzd2FwUm9vdFBvc2l0aW9uXSA9IHRlbXA7XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5kZWxldGVJZCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICB0aGlzLnJvb3REZWxldGVJZChpZCk7XG4gICAgICAgIHRoaXMubm9kZUFuZFN1Yk5vZGVzRGVsZXRlKGlkKTtcbiAgICAgICAgdGhpcy5ub2RlUmVmcmVuY2VzRGVsZXRlKGlkKTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLmluc2VydElkQmVmb3JlSWQgPSBmdW5jdGlvbiAoYmVmb3JlSWQsIGluc2VydElkKSB7XG4gICAgICAgIHZhciBmb3VuZFJvb3RJZEluZGV4ID0gdGhpcy5maW5kUm9vdElkKGJlZm9yZUlkKTtcbiAgICAgICAgaWYgKGZvdW5kUm9vdElkSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5pbnNlcnRJZEludG9Sb290KGluc2VydElkLCBmb3VuZFJvb3RJZEluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBub2RlS2V5IGluIHRoaXMubm9kZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGVzLmhhc093blByb3BlcnR5KG5vZGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kTm9kZUlkSW5kZXggPSB0aGlzLmZpbmROb2RlSWQobm9kZUtleSwgYmVmb3JlSWQpO1xuICAgICAgICAgICAgICAgIGlmIChmb3VuZE5vZGVJZEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRJZEludG9Ob2RlKG5vZGVLZXksIGluc2VydElkLCBmb3VuZE5vZGVJZEluZGV4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLmluc2VydElkQWZ0ZXJJZCA9IGZ1bmN0aW9uIChiZWxvd0lkLCBpbnNlcnRJZCkge1xuICAgICAgICB2YXIgZm91bmRSb290SWRJbmRleCA9IHRoaXMuZmluZFJvb3RJZChiZWxvd0lkKTtcbiAgICAgICAgaWYgKGZvdW5kUm9vdElkSW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5pbnNlcnRJZEludG9Sb290KGluc2VydElkLCBmb3VuZFJvb3RJZEluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgbm9kZUtleSBpbiB0aGlzLm5vZGVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ub2Rlcy5oYXNPd25Qcm9wZXJ0eShub2RlS2V5KSkge1xuICAgICAgICAgICAgICAgIHZhciBmb3VuZE5vZGVJZEluZGV4ID0gdGhpcy5maW5kTm9kZUlkKG5vZGVLZXksIGJlbG93SWQpO1xuICAgICAgICAgICAgICAgIGlmIChmb3VuZE5vZGVJZEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRJZEludG9Ob2RlKG5vZGVLZXksIGluc2VydElkLCBmb3VuZE5vZGVJZEluZGV4ICsgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5pbnNlcnRJZEludG9JZCA9IGZ1bmN0aW9uIChpbnNpZGVJZCwgaW5zZXJ0SWQpIHtcbiAgICAgICAgdGhpcy5ub2RlSW5zZXJ0QXRFbmQoaW5zaWRlSWQsIGluc2VydElkKTtcbiAgICAgICAgdGhpcy5ub2Rlc1tpbnNlcnRJZF0gPSBbXTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLmluc2VydElkSW50b1Jvb3QgPSBmdW5jdGlvbiAoaWQsIHBvc2l0aW9uKSB7XG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLnJvb3RJbnNlcnRBdEVuZChpZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAocG9zaXRpb24gPCAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlbmd0aF8xID0gdGhpcy5yb290SWRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3RJZHMuc3BsaWNlKChwb3NpdGlvbiArIGxlbmd0aF8xICsgMSksIDAsIGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucm9vdElkcy5zcGxpY2UocG9zaXRpb24sIDAsIGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5vZGVzW2lkXSA9IHRoaXMubm9kZXNbaWRdIHx8IFtdO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuaW5zZXJ0SWRJbnRvTm9kZSA9IGZ1bmN0aW9uIChub2RlS2V5LCBpZCwgcG9zaXRpb24pIHtcbiAgICAgICAgdGhpcy5ub2Rlc1tub2RlS2V5XSA9IHRoaXMubm9kZXNbbm9kZUtleV0gfHwgW107XG4gICAgICAgIHRoaXMubm9kZXNbaWRdID0gdGhpcy5ub2Rlc1tpZF0gfHwgW107XG4gICAgICAgIGlmIChwb3NpdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGVJbnNlcnRBdEVuZChub2RlS2V5LCBpZCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAocG9zaXRpb24gPCAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlbmd0aF8yID0gdGhpcy5ub2Rlc1tub2RlS2V5XS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2Rlc1tub2RlS2V5XS5zcGxpY2UoKHBvc2l0aW9uICsgbGVuZ3RoXzIgKyAxKSwgMCwgaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2Rlc1tub2RlS2V5XS5zcGxpY2UocG9zaXRpb24sIDAsIGlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUubW92ZUlkID0gZnVuY3Rpb24gKG1vdmVJZCwgYmVmb3JlSWQsIGRpcmVjdGlvbikge1xuICAgICAgICB2YXIgc291cmNlSWQgPSBtb3ZlSWQ7XG4gICAgICAgIHZhciBzb3VyY2VSb290SW5kZXggPSB0aGlzLmZpbmRSb290SWQoc291cmNlSWQpO1xuICAgICAgICB2YXIgc291cmNlTm9kZUtleTtcbiAgICAgICAgdmFyIHNvdXJjZU5vZGVJZEluZGV4O1xuICAgICAgICBpZiAodGhpcy5ub2Rlc1tiZWZvcmVJZF0pIHtcbiAgICAgICAgICAgIHNvdXJjZU5vZGVLZXkgPSBiZWZvcmVJZDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBub2RlS2V5IGluIHRoaXMubm9kZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGVzLmhhc093blByb3BlcnR5KG5vZGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgc291cmNlTm9kZUlkSW5kZXggPSB0aGlzLmZpbmROb2RlSWQobm9kZUtleSwgYmVmb3JlSWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGdvdCBhbGxcbiAgICAgICAgdmFyIHRhcmdldElkID0gYmVmb3JlSWQ7XG4gICAgICAgIHZhciB0YXJnZXRSb290SW5kZXggPSB0aGlzLmZpbmRSb290SWQodGFyZ2V0SWQpO1xuICAgICAgICB2YXIgdGFyZ2V0Tm9kZUtleTtcbiAgICAgICAgdmFyIHRhcmdldE5vZGVJZEluZGV4O1xuICAgICAgICBpZiAodGhpcy5ub2Rlc1tiZWZvcmVJZF0pIHtcbiAgICAgICAgICAgIHRhcmdldE5vZGVLZXkgPSBiZWZvcmVJZDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBub2RlS2V5IGluIHRoaXMubm9kZXMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm5vZGVzLmhhc093blByb3BlcnR5KG5vZGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0Tm9kZUlkSW5kZXggPSB0aGlzLmZpbmROb2RlSWQobm9kZUtleSwgYmVmb3JlSWQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGdvdCBhbGxcbiAgICAgICAgaWYgKHNvdXJjZVJvb3RJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICBpZiAodGFyZ2V0Um9vdEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBtb3Zpbmcgcm9vdCB0byByb290XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYE1vdmluZyBST09UIHRvIFJPT1RgKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgUm9vdElkczpgKTtcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnJvb3RJZHMpO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBUYXJnZXRJbmRleD0ke3RhcmdldFJvb3RJbmRleH0sIFNvdXJjZUluZGV4PSR7c291cmNlUm9vdEluZGV4fWApO1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBUYXJnZXRJZD0ke3RhcmdldElkfSwgU291cmNlSWQ9JHtzb3VyY2VJZH1gKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3REZWxldGUoc291cmNlUm9vdEluZGV4KTsgLy8gaW5kZXhlcyBjaGFuZ2Ugbm93XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldFJvb3RJbmRleCA+IHNvdXJjZVJvb3RJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRSb290SW5kZXgtLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkJFRk9SRTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0SWRJbnRvUm9vdChzb3VyY2VJZCwgdGFyZ2V0Um9vdEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5BRlRFUjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0SWRJbnRvUm9vdChzb3VyY2VJZCwgdGFyZ2V0Um9vdEluZGV4ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uSU5TSURFX0FUX1NUQVJUOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlSW5zZXJ0QXRTdGFydCh0YXJnZXRJZCwgc291cmNlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLklOU0lERV9BVF9FTkQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVJbnNlcnRBdEVuZCh0YXJnZXRJZCwgc291cmNlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gbW92aW5nIHJvb3QgKHNvdXJjZSkgQUJPVkUgbm9kZSAodGFyZ2V0KVxuICAgICAgICAgICAgICAgIC8vIHdpbGwgcmVtb3ZlIG9uZSBlbnRyeSBmcm9tIHJvb3RzXG4gICAgICAgICAgICAgICAgdGhpcy5yb290RGVsZXRlKHNvdXJjZVJvb3RJbmRleCk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbm9kZUtleSBpbiB0aGlzLm5vZGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm5vZGVzLmhhc093blByb3BlcnR5KG5vZGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmZpbmROb2RlSWQobm9kZUtleSwgdGFyZ2V0SWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5CRUZPUkU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydElkSW50b05vZGUobm9kZUtleSwgc291cmNlSWQsIGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5BRlRFUjpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0SWRJbnRvTm9kZShub2RlS2V5LCBzb3VyY2VJZCwgaW5kZXggKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5JTlNJREVfQVRfU1RBUlQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVJbnNlcnRBdFN0YXJ0KHRhcmdldElkLCBzb3VyY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uSU5TSURFX0FUX0VORDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUluc2VydEF0RW5kKHRhcmdldElkLCBzb3VyY2VJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAodGFyZ2V0Um9vdEluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBtb3Zpbmcgbm9kZSAoc291cmNlKSBBQk9WRSByb290ICh0YXJnZXQpXG4gICAgICAgICAgICAgICAgLy8gZGVsZXRlIHNvdXJjZSBpZCBmcm9tIGVhY2ggbm9kZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIG5vZGVLZXkgaW4gdGhpcy5ub2Rlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ub2Rlcy5oYXNPd25Qcm9wZXJ0eShub2RlS2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5maW5kTm9kZUlkKG5vZGVLZXksIHNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5ub2RlSW5zZXJ0SWQobm9kZUtleSwgc291cmNlSWQsIGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVEZWxldGVBdEluZGV4KG5vZGVLZXksIGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5CRUZPUkU6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydElkSW50b1Jvb3Qoc291cmNlSWQsIHRhcmdldFJvb3RJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uQUZURVI6XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc2VydElkSW50b1Jvb3Qoc291cmNlSWQsIHRhcmdldFJvb3RJbmRleCArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLklOU0lERV9BVF9TVEFSVDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUluc2VydEF0U3RhcnQodGFyZ2V0SWQsIHNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5JTlNJREVfQVRfRU5EOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlSW5zZXJ0QXRFbmQodGFyZ2V0SWQsIHNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIG1vdmluZyBub2RlIChzb3VyY2UpIEFCT1ZFIG5vZGUgKHRhcmdldClcbiAgICAgICAgICAgICAgICAvLyBkZWxldGUgc291cmNlIGlkIGZyb20gZWFjaCBub2RlXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbm9kZUtleSBpbiB0aGlzLm5vZGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm5vZGVzLmhhc093blByb3BlcnR5KG5vZGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmZpbmROb2RlSWQobm9kZUtleSwgc291cmNlSWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGVEZWxldGVBdEluZGV4KG5vZGVLZXksIGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBub2RlS2V5IGluIHRoaXMubm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubm9kZXMuaGFzT3duUHJvcGVydHkobm9kZUtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuZmluZE5vZGVJZChub2RlS2V5LCB0YXJnZXRJZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkJFRk9SRTpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0SWRJbnRvTm9kZShub2RlS2V5LCBzb3VyY2VJZCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkFGVEVSOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRJZEludG9Ob2RlKG5vZGVLZXksIHNvdXJjZUlkLCBpbmRleCArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLklOU0lERV9BVF9TVEFSVDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm9kZUluc2VydEF0U3RhcnQodGFyZ2V0SWQsIHNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5JTlNJREVfQVRfRU5EOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlSW5zZXJ0QXRFbmQodGFyZ2V0SWQsIHNvdXJjZUlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuc3dhcEFycmF5RWxlbWVudHMgPSBmdW5jdGlvbiAoYXJyLCBpbmRleEEsIGluZGV4Qikge1xuICAgICAgICB2YXIgdGVtcCA9IGFycltpbmRleEFdO1xuICAgICAgICBhcnJbaW5kZXhBXSA9IGFycltpbmRleEJdO1xuICAgICAgICBhcnJbaW5kZXhCXSA9IHRlbXA7XG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5yb290RGVsZXRlSWQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5maW5kUm9vdElkKGlkKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucm9vdERlbGV0ZShpbmRleCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLm5vZGVBbmRTdWJOb2Rlc0RlbGV0ZSA9IGZ1bmN0aW9uIChub2RlS2V5KSB7XG4gICAgICAgIHZhciB0b0RlbGV0ZUxhdGVyID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ub2Rlc1tub2RlS2V5XS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGlkID0gdGhpcy5ub2Rlc1tub2RlS2V5XVtpXTtcbiAgICAgICAgICAgIHRoaXMubm9kZUFuZFN1Yk5vZGVzRGVsZXRlKGlkKTtcbiAgICAgICAgICAgIHRvRGVsZXRlTGF0ZXIucHVzaChub2RlS2V5KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5vZGVEZWxldGUobm9kZUtleSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9EZWxldGVMYXRlci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5ub2RlRGVsZXRlKHRvRGVsZXRlTGF0ZXJbaV0pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5ub2RlUmVmcmVuY2VzRGVsZXRlID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIGZvciAodmFyIG5vZGVLZXkgaW4gdGhpcy5ub2Rlcykge1xuICAgICAgICAgICAgaWYgKHRoaXMubm9kZXMuaGFzT3duUHJvcGVydHkobm9kZUtleSkpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubm9kZXNbbm9kZUtleV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldElkID0gdGhpcy5ub2Rlc1tub2RlS2V5XVtpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldElkID09PSBpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5ub2RlRGVsZXRlQXRJbmRleChub2RlS2V5LCBpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUubm9kZURlbGV0ZSA9IGZ1bmN0aW9uIChub2RlS2V5KSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLm5vZGVzW25vZGVLZXldO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuZmluZFJvb3RJZCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb290SWRzLmluZGV4T2YoaWQpO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUuZmluZE5vZGVJZCA9IGZ1bmN0aW9uIChub2RlS2V5LCBpZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ub2Rlc1tub2RlS2V5XS5pbmRleE9mKGlkKTtcbiAgICB9O1xuICAgIE11bHRpUm9vdFRyZWUucHJvdG90eXBlLmZpbmROb2RlID0gZnVuY3Rpb24gKG5vZGVLZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZXNbbm9kZUtleV07XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5ub2RlSW5zZXJ0QXRTdGFydCA9IGZ1bmN0aW9uIChub2RlS2V5LCBpZCkge1xuICAgICAgICB0aGlzLm5vZGVzW25vZGVLZXldLnVuc2hpZnQoaWQpO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUubm9kZUluc2VydEF0RW5kID0gZnVuY3Rpb24gKG5vZGVLZXksIGlkKSB7XG4gICAgICAgIHRoaXMubm9kZXNbbm9kZUtleV0ucHVzaChpZCk7XG4gICAgfTtcbiAgICBNdWx0aVJvb3RUcmVlLnByb3RvdHlwZS5yb290RGVsZXRlID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgIHRoaXMucm9vdElkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUubm9kZURlbGV0ZUF0SW5kZXggPSBmdW5jdGlvbiAobm9kZUtleSwgaW5kZXgpIHtcbiAgICAgICAgdGhpcy5ub2Rlc1tub2RlS2V5XS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUucm9vdEluc2VydEF0U3RhcnQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgdGhpcy5yb290SWRzLnVuc2hpZnQoaWQpO1xuICAgIH07XG4gICAgTXVsdGlSb290VHJlZS5wcm90b3R5cGUucm9vdEluc2VydEF0RW5kID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHRoaXMucm9vdElkcy5wdXNoKGlkKTtcbiAgICB9O1xuICAgIHJldHVybiBNdWx0aVJvb3RUcmVlO1xufSgpKTtcbmV4cG9ydHMuZGVmYXVsdCA9IE11bHRpUm9vdFRyZWU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1NdWx0aVJvb3RUcmVlLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xudmFyIEhlYXBfMSA9IHJlcXVpcmUoXCIuL0hlYXBcIik7XG52YXIgUHJpb3JpdHlRdWV1ZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGFuIGVtcHR5IHByaW9yaXR5IHF1ZXVlLlxuICAgICAqIEBjbGFzcyA8cD5JbiBhIHByaW9yaXR5IHF1ZXVlIGVhY2ggZWxlbWVudCBpcyBhc3NvY2lhdGVkIHdpdGggYSBcInByaW9yaXR5XCIsXG4gICAgICogZWxlbWVudHMgYXJlIGRlcXVldWVkIGluIGhpZ2hlc3QtcHJpb3JpdHktZmlyc3Qgb3JkZXIgKHRoZSBlbGVtZW50cyB3aXRoIHRoZVxuICAgICAqIGhpZ2hlc3QgcHJpb3JpdHkgYXJlIGRlcXVldWVkIGZpcnN0KS4gUHJpb3JpdHkgUXVldWVzIGFyZSBpbXBsZW1lbnRlZCBhcyBoZWFwcy5cbiAgICAgKiBJZiB0aGUgaW5zZXJ0ZWQgZWxlbWVudHMgYXJlIGN1c3RvbSBvYmplY3RzIGEgY29tcGFyZSBmdW5jdGlvbiBtdXN0IGJlIHByb3ZpZGVkLFxuICAgICAqIG90aGVyd2lzZSB0aGUgPD0sID09PSBhbmQgPj0gb3BlcmF0b3JzIGFyZSB1c2VkIHRvIGNvbXBhcmUgb2JqZWN0IHByaW9yaXR5LjwvcD5cbiAgICAgKiA8cHJlPlxuICAgICAqIGZ1bmN0aW9uIGNvbXBhcmUoYSwgYikge1xuICAgICAqICBpZiAoYSBpcyBsZXNzIHRoYW4gYiBieSBzb21lIG9yZGVyaW5nIGNyaXRlcmlvbikge1xuICAgICAqICAgICByZXR1cm4gLTE7XG4gICAgICogIH0gaWYgKGEgaXMgZ3JlYXRlciB0aGFuIGIgYnkgdGhlIG9yZGVyaW5nIGNyaXRlcmlvbikge1xuICAgICAqICAgICByZXR1cm4gMTtcbiAgICAgKiAgfVxuICAgICAqICAvLyBhIG11c3QgYmUgZXF1YWwgdG8gYlxuICAgICAqICByZXR1cm4gMDtcbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpudW1iZXI9fSBjb21wYXJlRnVuY3Rpb24gb3B0aW9uYWxcbiAgICAgKiBmdW5jdGlvbiB1c2VkIHRvIGNvbXBhcmUgdHdvIGVsZW1lbnQgcHJpb3JpdGllcy4gTXVzdCByZXR1cm4gYSBuZWdhdGl2ZSBpbnRlZ2VyLFxuICAgICAqIHplcm8sIG9yIGEgcG9zaXRpdmUgaW50ZWdlciBhcyB0aGUgZmlyc3QgYXJndW1lbnQgaXMgbGVzcyB0aGFuLCBlcXVhbCB0byxcbiAgICAgKiBvciBncmVhdGVyIHRoYW4gdGhlIHNlY29uZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBQcmlvcml0eVF1ZXVlKGNvbXBhcmVGdW5jdGlvbikge1xuICAgICAgICB0aGlzLmhlYXAgPSBuZXcgSGVhcF8xLmRlZmF1bHQodXRpbC5yZXZlcnNlQ29tcGFyZUZ1bmN0aW9uKGNvbXBhcmVGdW5jdGlvbikpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbnNlcnRzIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpbnRvIHRoaXMgcHJpb3JpdHkgcXVldWUuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgdGhlIGVsZW1lbnQgdG8gaW5zZXJ0LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGVsZW1lbnQgd2FzIGluc2VydGVkLCBvciBmYWxzZSBpZiBpdCBpcyB1bmRlZmluZWQuXG4gICAgICovXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuZW5xdWV1ZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlYXAuYWRkKGVsZW1lbnQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaW50byB0aGlzIHByaW9yaXR5IHF1ZXVlLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IHRoZSBlbGVtZW50IHRvIGluc2VydC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBpbnNlcnRlZCwgb3IgZmFsc2UgaWYgaXQgaXMgdW5kZWZpbmVkLlxuICAgICAqL1xuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhlYXAuYWRkKGVsZW1lbnQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIGFuZCByZW1vdmVzIHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnQgb2YgdGhpcyBxdWV1ZS5cbiAgICAgKiBAcmV0dXJuIHsqfSB0aGUgdGhlIGhpZ2hlc3QgcHJpb3JpdHkgZWxlbWVudCBvZiB0aGlzIHF1ZXVlLFxuICAgICAqICBvciB1bmRlZmluZWQgaWYgdGhpcyBxdWV1ZSBpcyBlbXB0eS5cbiAgICAgKi9cbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5kZXF1ZXVlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5oZWFwLnNpemUoKSAhPT0gMCkge1xuICAgICAgICAgICAgdmFyIGVsID0gdGhpcy5oZWFwLnBlZWsoKTtcbiAgICAgICAgICAgIHRoaXMuaGVhcC5yZW1vdmVSb290KCk7XG4gICAgICAgICAgICByZXR1cm4gZWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHJpZXZlcywgYnV0IGRvZXMgbm90IHJlbW92ZSwgdGhlIGhpZ2hlc3QgcHJpb3JpdHkgZWxlbWVudCBvZiB0aGlzIHF1ZXVlLlxuICAgICAqIEByZXR1cm4geyp9IHRoZSBoaWdoZXN0IHByaW9yaXR5IGVsZW1lbnQgb2YgdGhpcyBxdWV1ZSwgb3IgdW5kZWZpbmVkIGlmIHRoaXMgcXVldWUgaXMgZW1wdHkuXG4gICAgICovXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUucGVlayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVhcC5wZWVrKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBwcmlvcml0eSBxdWV1ZSBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgZWxlbWVudCB0byBzZWFyY2ggZm9yLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBwcmlvcml0eSBxdWV1ZSBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQsXG4gICAgICogZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIFByaW9yaXR5UXVldWUucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVhcC5jb250YWlucyhlbGVtZW50KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGlzIHByaW9yaXR5IHF1ZXVlIGlzIGVtcHR5LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgYW5kIG9ubHkgaWYgdGhpcyBwcmlvcml0eSBxdWV1ZSBjb250YWlucyBubyBpdGVtczsgZmFsc2VcbiAgICAgKiBvdGhlcndpc2UuXG4gICAgICovXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVhcC5pc0VtcHR5KCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBwcmlvcml0eSBxdWV1ZS5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBwcmlvcml0eSBxdWV1ZS5cbiAgICAgKi9cbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZWFwLnNpemUoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgcHJpb3JpdHkgcXVldWUuXG4gICAgICovXG4gICAgUHJpb3JpdHlRdWV1ZS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaGVhcC5jbGVhcigpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZXMgdGhlIHByb3ZpZGVkIGZ1bmN0aW9uIG9uY2UgZm9yIGVhY2ggZWxlbWVudCBwcmVzZW50IGluIHRoaXMgcXVldWUgaW5cbiAgICAgKiBubyBwYXJ0aWN1bGFyIG9yZGVyLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xuICAgICAqIGludm9rZWQgd2l0aCBvbmUgYXJndW1lbnQ6IHRoZSBlbGVtZW50IHZhbHVlLCB0byBicmVhayB0aGUgaXRlcmF0aW9uIHlvdSBjYW5cbiAgICAgKiBvcHRpb25hbGx5IHJldHVybiBmYWxzZS5cbiAgICAgKi9cbiAgICBQcmlvcml0eVF1ZXVlLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMuaGVhcC5mb3JFYWNoKGNhbGxiYWNrKTtcbiAgICB9O1xuICAgIHJldHVybiBQcmlvcml0eVF1ZXVlO1xufSgpKTsgLy8gZW5kIG9mIHByaW9yaXR5IHF1ZXVlXG5leHBvcnRzLmRlZmF1bHQgPSBQcmlvcml0eVF1ZXVlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9UHJpb3JpdHlRdWV1ZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBMaW5rZWRMaXN0XzEgPSByZXF1aXJlKFwiLi9MaW5rZWRMaXN0XCIpO1xudmFyIFF1ZXVlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gZW1wdHkgcXVldWUuXG4gICAgICogQGNsYXNzIEEgcXVldWUgaXMgYSBGaXJzdC1Jbi1GaXJzdC1PdXQgKEZJRk8pIGRhdGEgc3RydWN0dXJlLCB0aGUgZmlyc3RcbiAgICAgKiBlbGVtZW50IGFkZGVkIHRvIHRoZSBxdWV1ZSB3aWxsIGJlIHRoZSBmaXJzdCBvbmUgdG8gYmUgcmVtb3ZlZC4gVGhpc1xuICAgICAqIGltcGxlbWVudGF0aW9uIHVzZXMgYSBsaW5rZWQgbGlzdCBhcyBhIGNvbnRhaW5lci5cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBRdWV1ZSgpIHtcbiAgICAgICAgdGhpcy5saXN0ID0gbmV3IExpbmtlZExpc3RfMS5kZWZhdWx0KCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluc2VydHMgdGhlIHNwZWNpZmllZCBlbGVtZW50IGludG8gdGhlIGVuZCBvZiB0aGlzIHF1ZXVlLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIHRoZSBlbGVtZW50IHRvIGluc2VydC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBpbnNlcnRlZCwgb3IgZmFsc2UgaWYgaXQgaXMgdW5kZWZpbmVkLlxuICAgICAqL1xuICAgIFF1ZXVlLnByb3RvdHlwZS5lbnF1ZXVlID0gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5hZGQoZWxlbSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBJbnNlcnRzIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpbnRvIHRoZSBlbmQgb2YgdGhpcyBxdWV1ZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSB0aGUgZWxlbWVudCB0byBpbnNlcnQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZWxlbWVudCB3YXMgaW5zZXJ0ZWQsIG9yIGZhbHNlIGlmIGl0IGlzIHVuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBRdWV1ZS5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5hZGQoZWxlbSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgYW5kIHJlbW92ZXMgdGhlIGhlYWQgb2YgdGhpcyBxdWV1ZS5cbiAgICAgKiBAcmV0dXJuIHsqfSB0aGUgaGVhZCBvZiB0aGlzIHF1ZXVlLCBvciB1bmRlZmluZWQgaWYgdGhpcyBxdWV1ZSBpcyBlbXB0eS5cbiAgICAgKi9cbiAgICBRdWV1ZS5wcm90b3R5cGUuZGVxdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMubGlzdC5zaXplKCkgIT09IDApIHtcbiAgICAgICAgICAgIHZhciBlbCA9IHRoaXMubGlzdC5maXJzdCgpO1xuICAgICAgICAgICAgdGhpcy5saXN0LnJlbW92ZUVsZW1lbnRBdEluZGV4KDApO1xuICAgICAgICAgICAgcmV0dXJuIGVsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMsIGJ1dCBkb2VzIG5vdCByZW1vdmUsIHRoZSBoZWFkIG9mIHRoaXMgcXVldWUuXG4gICAgICogQHJldHVybiB7Kn0gdGhlIGhlYWQgb2YgdGhpcyBxdWV1ZSwgb3IgdW5kZWZpbmVkIGlmIHRoaXMgcXVldWUgaXMgZW1wdHkuXG4gICAgICovXG4gICAgUXVldWUucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmxpc3Quc2l6ZSgpICE9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0LmZpcnN0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIHF1ZXVlLlxuICAgICAqIEByZXR1cm4ge251bWJlcn0gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIHF1ZXVlLlxuICAgICAqL1xuICAgIFF1ZXVlLnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0LnNpemUoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHF1ZXVlIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKiA8cD5JZiB0aGUgZWxlbWVudHMgaW5zaWRlIHRoaXMgc3RhY2sgYXJlXG4gICAgICogbm90IGNvbXBhcmFibGUgd2l0aCB0aGUgPT09IG9wZXJhdG9yLCBhIGN1c3RvbSBlcXVhbHMgZnVuY3Rpb24gc2hvdWxkIGJlXG4gICAgICogcHJvdmlkZWQgdG8gcGVyZm9ybSBzZWFyY2hlcywgdGhlIGZ1bmN0aW9uIG11c3QgcmVjZWl2ZSB0d28gYXJndW1lbnRzIGFuZFxuICAgICAqIHJldHVybiB0cnVlIGlmIHRoZXkgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuIEV4YW1wbGU6PC9wPlxuICAgICAqXG4gICAgICogPHByZT5cbiAgICAgKiBjb25zdCBwZXRzQXJlRXF1YWxCeU5hbWUgKHBldDEsIHBldDIpIHtcbiAgICAgKiAgcmV0dXJuIHBldDEubmFtZSA9PT0gcGV0Mi5uYW1lO1xuICAgICAqIH1cbiAgICAgKiA8L3ByZT5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbSBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gb3B0aW9uYWxcbiAgICAgKiBmdW5jdGlvbiB0byBjaGVjayBpZiB0d28gZWxlbWVudHMgYXJlIGVxdWFsLlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBxdWV1ZSBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQsXG4gICAgICogZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIFF1ZXVlLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uIChlbGVtLCBlcXVhbHNGdW5jdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0LmNvbnRhaW5zKGVsZW0sIGVxdWFsc0Z1bmN0aW9uKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIENoZWNrcyBpZiB0aGlzIHF1ZXVlIGlzIGVtcHR5LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgYW5kIG9ubHkgaWYgdGhpcyBxdWV1ZSBjb250YWlucyBubyBpdGVtczsgZmFsc2VcbiAgICAgKiBvdGhlcndpc2UuXG4gICAgICovXG4gICAgUXVldWUucHJvdG90eXBlLmlzRW1wdHkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3Quc2l6ZSgpIDw9IDA7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgZWxlbWVudHMgZnJvbSB0aGlzIHF1ZXVlLlxuICAgICAqL1xuICAgIFF1ZXVlLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5saXN0LmNsZWFyKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyBxdWV1ZSBpblxuICAgICAqIEZJRk8gb3JkZXIuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOip9IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGV4ZWN1dGUsIGl0IGlzXG4gICAgICogaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhblxuICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxuICAgICAqL1xuICAgIFF1ZXVlLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMubGlzdC5mb3JFYWNoKGNhbGxiYWNrKTtcbiAgICB9O1xuICAgIHJldHVybiBRdWV1ZTtcbn0oKSk7IC8vIEVuZCBvZiBxdWV1ZVxuZXhwb3J0cy5kZWZhdWx0ID0gUXVldWU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1RdWV1ZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbnZhciBhcnJheXMgPSByZXF1aXJlKFwiLi9hcnJheXNcIik7XG52YXIgRGljdGlvbmFyeV8xID0gcmVxdWlyZShcIi4vRGljdGlvbmFyeVwiKTtcbnZhciBTZXQgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBlbXB0eSBzZXQuXG4gICAgICogQGNsYXNzIDxwPkEgc2V0IGlzIGEgZGF0YSBzdHJ1Y3R1cmUgdGhhdCBjb250YWlucyBubyBkdXBsaWNhdGUgaXRlbXMuPC9wPlxuICAgICAqIDxwPklmIHRoZSBpbnNlcnRlZCBlbGVtZW50cyBhcmUgY3VzdG9tIG9iamVjdHMgYSBmdW5jdGlvblxuICAgICAqIHdoaWNoIGNvbnZlcnRzIGVsZW1lbnRzIHRvIHN0cmluZ3MgbXVzdCBiZSBwcm92aWRlZC4gRXhhbXBsZTo8L3A+XG4gICAgICpcbiAgICAgKiA8cHJlPlxuICAgICAqIGZ1bmN0aW9uIHBldFRvU3RyaW5nKHBldCkge1xuICAgICAqICByZXR1cm4gcGV0Lm5hbWU7XG4gICAgICogfVxuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QpOnN0cmluZz19IHRvU3RyaW5nRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdXNlZFxuICAgICAqIHRvIGNvbnZlcnQgZWxlbWVudHMgdG8gc3RyaW5ncy4gSWYgdGhlIGVsZW1lbnRzIGFyZW4ndCBzdHJpbmdzIG9yIGlmIHRvU3RyaW5nKClcbiAgICAgKiBpcyBub3QgYXBwcm9wcmlhdGUsIGEgY3VzdG9tIGZ1bmN0aW9uIHdoaWNoIHJlY2VpdmVzIGFuIG9iamVjdCBhbmQgcmV0dXJucyBhXG4gICAgICogdW5pcXVlIHN0cmluZyBtdXN0IGJlIHByb3ZpZGVkLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFNldCh0b1N0cmluZ0Z1bmN0aW9uKSB7XG4gICAgICAgIHRoaXMuZGljdGlvbmFyeSA9IG5ldyBEaWN0aW9uYXJ5XzEuZGVmYXVsdCh0b1N0cmluZ0Z1bmN0aW9uKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0cnVlIGlmIHRoaXMgc2V0IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCBlbGVtZW50IHRvIHNlYXJjaCBmb3IuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHNldCBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQsXG4gICAgICogZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kaWN0aW9uYXJ5LmNvbnRhaW5zS2V5KGVsZW1lbnQpO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQWRkcyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgdG8gdGhpcyBzZXQgaWYgaXQgaXMgbm90IGFscmVhZHkgcHJlc2VudC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCB0aGUgZWxlbWVudCB0byBpbnNlcnQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHNldCBkaWQgbm90IGFscmVhZHkgY29udGFpbiB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICovXG4gICAgU2V0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBpZiAodGhpcy5jb250YWlucyhlbGVtZW50KSB8fCB1dGlsLmlzVW5kZWZpbmVkKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRpY3Rpb25hcnkuc2V0VmFsdWUoZWxlbWVudCwgZWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyoqXG4gICAgICogUGVyZm9ybXMgYW4gaW50ZXJzZWN0aW9uIGJldHdlZW4gdGhpcyBhbmQgYW5vdGhlciBzZXQuXG4gICAgICogUmVtb3ZlcyBhbGwgdmFsdWVzIHRoYXQgYXJlIG5vdCBwcmVzZW50IHRoaXMgc2V0IGFuZCB0aGUgZ2l2ZW4gc2V0LlxuICAgICAqIEBwYXJhbSB7Y29sbGVjdGlvbnMuU2V0fSBvdGhlclNldCBvdGhlciBzZXQuXG4gICAgICovXG4gICAgU2V0LnByb3RvdHlwZS5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbiAob3RoZXJTZXQpIHtcbiAgICAgICAgdmFyIHNldCA9IHRoaXM7XG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKCFvdGhlclNldC5jb250YWlucyhlbGVtZW50KSkge1xuICAgICAgICAgICAgICAgIHNldC5yZW1vdmUoZWxlbWVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyBhIHVuaW9uIGJldHdlZW4gdGhpcyBhbmQgYW5vdGhlciBzZXQuXG4gICAgICogQWRkcyBhbGwgdmFsdWVzIGZyb20gdGhlIGdpdmVuIHNldCB0byB0aGlzIHNldC5cbiAgICAgKiBAcGFyYW0ge2NvbGxlY3Rpb25zLlNldH0gb3RoZXJTZXQgb3RoZXIgc2V0LlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUudW5pb24gPSBmdW5jdGlvbiAob3RoZXJTZXQpIHtcbiAgICAgICAgdmFyIHNldCA9IHRoaXM7XG4gICAgICAgIG90aGVyU2V0LmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHNldC5hZGQoZWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyBhIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGlzIGFuZCBhbm90aGVyIHNldC5cbiAgICAgKiBSZW1vdmVzIGZyb20gdGhpcyBzZXQgYWxsIHRoZSB2YWx1ZXMgdGhhdCBhcmUgcHJlc2VudCBpbiB0aGUgZ2l2ZW4gc2V0LlxuICAgICAqIEBwYXJhbSB7Y29sbGVjdGlvbnMuU2V0fSBvdGhlclNldCBvdGhlciBzZXQuXG4gICAgICovXG4gICAgU2V0LnByb3RvdHlwZS5kaWZmZXJlbmNlID0gZnVuY3Rpb24gKG90aGVyU2V0KSB7XG4gICAgICAgIHZhciBzZXQgPSB0aGlzO1xuICAgICAgICBvdGhlclNldC5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICBzZXQucmVtb3ZlKGVsZW1lbnQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIHNldCBjb250YWlucyBhbGwgdGhlIGVsZW1lbnRzIGluIHRoaXMgc2V0LlxuICAgICAqIEBwYXJhbSB7Y29sbGVjdGlvbnMuU2V0fSBvdGhlclNldCBvdGhlciBzZXQuXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGlzIHNldCBpcyBhIHN1YnNldCBvZiB0aGUgZ2l2ZW4gc2V0LlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUuaXNTdWJzZXRPZiA9IGZ1bmN0aW9uIChvdGhlclNldCkge1xuICAgICAgICBpZiAodGhpcy5zaXplKCkgPiBvdGhlclNldC5zaXplKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaXNTdWIgPSB0cnVlO1xuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmICghb3RoZXJTZXQuY29udGFpbnMoZWxlbWVudCkpIHtcbiAgICAgICAgICAgICAgICBpc1N1YiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGlzU3ViO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgZnJvbSB0aGlzIHNldCBpZiBpdCBpcyBwcmVzZW50LlxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhpcyBzZXQgY29udGFpbmVkIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAgICAgKi9cbiAgICBTZXQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIGlmICghdGhpcy5jb250YWlucyhlbGVtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kaWN0aW9uYXJ5LnJlbW92ZShlbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50XG4gICAgICogcHJlc2VudCBpbiB0aGlzIHNldC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcbiAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50czogdGhlIGVsZW1lbnQuIFRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhblxuICAgICAqIG9wdGlvbmFsbHkgcmV0dXJuIGZhbHNlLlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmRpY3Rpb25hcnkuZm9yRWFjaChmdW5jdGlvbiAoaywgdikge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHYpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgc2V0IGluIGFyYml0cmFyeSBvcmRlci5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gYW4gYXJyYXkgY29udGFpbmluZyBhbGwgb2YgdGhlIGVsZW1lbnRzIGluIHRoaXMgc2V0LlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGljdGlvbmFyeS52YWx1ZXMoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJldHVybnMgdHJ1ZSBpZiB0aGlzIHNldCBjb250YWlucyBubyBlbGVtZW50cy5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgc2V0IGNvbnRhaW5zIG5vIGVsZW1lbnRzLlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGljdGlvbmFyeS5pc0VtcHR5KCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBzZXQuXG4gICAgICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoaXMgc2V0LlxuICAgICAqL1xuICAgIFNldC5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGljdGlvbmFyeS5zaXplKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIGFsbCBvZiB0aGUgZWxlbWVudHMgZnJvbSB0aGlzIHNldC5cbiAgICAgKi9cbiAgICBTZXQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmRpY3Rpb25hcnkuY2xlYXIoKTtcbiAgICB9O1xuICAgIC8qXG4gICAgKiBQcm92aWRlcyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBmb3IgZGlzcGxheVxuICAgICovXG4gICAgU2V0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGFycmF5cy50b1N0cmluZyh0aGlzLnRvQXJyYXkoKSk7XG4gICAgfTtcbiAgICByZXR1cm4gU2V0O1xufSgpKTsgLy8gZW5kIG9mIFNldFxuZXhwb3J0cy5kZWZhdWx0ID0gU2V0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9U2V0LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIExpbmtlZExpc3RfMSA9IHJlcXVpcmUoXCIuL0xpbmtlZExpc3RcIik7XG52YXIgU3RhY2sgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBlbXB0eSBTdGFjay5cbiAgICAgKiBAY2xhc3MgQSBTdGFjayBpcyBhIExhc3QtSW4tRmlyc3QtT3V0IChMSUZPKSBkYXRhIHN0cnVjdHVyZSwgdGhlIGxhc3RcbiAgICAgKiBlbGVtZW50IGFkZGVkIHRvIHRoZSBzdGFjayB3aWxsIGJlIHRoZSBmaXJzdCBvbmUgdG8gYmUgcmVtb3ZlZC4gVGhpc1xuICAgICAqIGltcGxlbWVudGF0aW9uIHVzZXMgYSBsaW5rZWQgbGlzdCBhcyBhIGNvbnRhaW5lci5cbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBTdGFjaygpIHtcbiAgICAgICAgdGhpcy5saXN0ID0gbmV3IExpbmtlZExpc3RfMS5kZWZhdWx0KCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1c2hlcyBhbiBpdGVtIG9udG8gdGhlIHRvcCBvZiB0aGlzIHN0YWNrLlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIHRoZSBlbGVtZW50IHRvIGJlIHB1c2hlZCBvbnRvIHRoaXMgc3RhY2suXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgZWxlbWVudCB3YXMgcHVzaGVkIG9yIGZhbHNlIGlmIGl0IGlzIHVuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBTdGFjay5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3QuYWRkKGVsZW0sIDApO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogUHVzaGVzIGFuIGl0ZW0gb250byB0aGUgdG9wIG9mIHRoaXMgc3RhY2suXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gdGhlIGVsZW1lbnQgdG8gYmUgcHVzaGVkIG9udG8gdGhpcyBzdGFjay5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoZSBlbGVtZW50IHdhcyBwdXNoZWQgb3IgZmFsc2UgaWYgaXQgaXMgdW5kZWZpbmVkLlxuICAgICAqL1xuICAgIFN0YWNrLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiAoZWxlbSkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0LmFkZChlbGVtLCAwKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIG9iamVjdCBhdCB0aGUgdG9wIG9mIHRoaXMgc3RhY2sgYW5kIHJldHVybnMgdGhhdCBvYmplY3QuXG4gICAgICogQHJldHVybiB7Kn0gdGhlIG9iamVjdCBhdCB0aGUgdG9wIG9mIHRoaXMgc3RhY2sgb3IgdW5kZWZpbmVkIGlmIHRoZVxuICAgICAqIHN0YWNrIGlzIGVtcHR5LlxuICAgICAqL1xuICAgIFN0YWNrLnByb3RvdHlwZS5wb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpc3QucmVtb3ZlRWxlbWVudEF0SW5kZXgoMCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBMb29rcyBhdCB0aGUgb2JqZWN0IGF0IHRoZSB0b3Agb2YgdGhpcyBzdGFjayB3aXRob3V0IHJlbW92aW5nIGl0IGZyb20gdGhlXG4gICAgICogc3RhY2suXG4gICAgICogQHJldHVybiB7Kn0gdGhlIG9iamVjdCBhdCB0aGUgdG9wIG9mIHRoaXMgc3RhY2sgb3IgdW5kZWZpbmVkIGlmIHRoZVxuICAgICAqIHN0YWNrIGlzIGVtcHR5LlxuICAgICAqL1xuICAgIFN0YWNrLnByb3RvdHlwZS5wZWVrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0LmZpcnN0KCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBzdGFjay5cbiAgICAgKiBAcmV0dXJuIHtudW1iZXJ9IHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gdGhpcyBzdGFjay5cbiAgICAgKi9cbiAgICBTdGFjay5wcm90b3R5cGUuc2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5zaXplKCk7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhpcyBzdGFjayBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gICAgICogPHA+SWYgdGhlIGVsZW1lbnRzIGluc2lkZSB0aGlzIHN0YWNrIGFyZVxuICAgICAqIG5vdCBjb21wYXJhYmxlIHdpdGggdGhlID09PSBvcGVyYXRvciwgYSBjdXN0b20gZXF1YWxzIGZ1bmN0aW9uIHNob3VsZCBiZVxuICAgICAqIHByb3ZpZGVkIHRvIHBlcmZvcm0gc2VhcmNoZXMsIHRoZSBmdW5jdGlvbiBtdXN0IHJlY2VpdmUgdHdvIGFyZ3VtZW50cyBhbmRcbiAgICAgKiByZXR1cm4gdHJ1ZSBpZiB0aGV5IGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLiBFeGFtcGxlOjwvcD5cbiAgICAgKlxuICAgICAqIDxwcmU+XG4gICAgICogY29uc3QgcGV0c0FyZUVxdWFsQnlOYW1lIChwZXQxLCBwZXQyKSB7XG4gICAgICogIHJldHVybiBwZXQxLm5hbWUgPT09IHBldDIubmFtZTtcbiAgICAgKiB9XG4gICAgICogPC9wcmU+XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gZWxlbWVudCB0byBzZWFyY2ggZm9yLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsXG4gICAgICogZnVuY3Rpb24gdG8gY2hlY2sgaWYgdHdvIGVsZW1lbnRzIGFyZSBlcXVhbC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIHRoaXMgc3RhY2sgY29udGFpbnMgdGhlIHNwZWNpZmllZCBlbGVtZW50LFxuICAgICAqIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBTdGFjay5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiAoZWxlbSwgZXF1YWxzRnVuY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdC5jb250YWlucyhlbGVtLCBlcXVhbHNGdW5jdGlvbik7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBDaGVja3MgaWYgdGhpcyBzdGFjayBpcyBlbXB0eS5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSB0cnVlIGlmIGFuZCBvbmx5IGlmIHRoaXMgc3RhY2sgY29udGFpbnMgbm8gaXRlbXM7IGZhbHNlXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIFN0YWNrLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXN0LmlzRW1wdHkoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIG9mIHRoZSBlbGVtZW50cyBmcm9tIHRoaXMgc3RhY2suXG4gICAgICovXG4gICAgU3RhY2sucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxpc3QuY2xlYXIoKTtcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIEV4ZWN1dGVzIHRoZSBwcm92aWRlZCBmdW5jdGlvbiBvbmNlIGZvciBlYWNoIGVsZW1lbnQgcHJlc2VudCBpbiB0aGlzIHN0YWNrIGluXG4gICAgICogTElGTyBvcmRlci5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCk6Kn0gY2FsbGJhY2sgZnVuY3Rpb24gdG8gZXhlY3V0ZSwgaXQgaXNcbiAgICAgKiBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OiB0aGUgZWxlbWVudCB2YWx1ZSwgdG8gYnJlYWsgdGhlIGl0ZXJhdGlvbiB5b3UgY2FuXG4gICAgICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gICAgICovXG4gICAgU3RhY2sucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5saXN0LmZvckVhY2goY2FsbGJhY2spO1xuICAgIH07XG4gICAgcmV0dXJuIFN0YWNrO1xufSgpKTsgLy8gRW5kIG9mIHN0YWNrXG5leHBvcnRzLmRlZmF1bHQgPSBTdGFjaztcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVN0YWNrLmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc3BlY2lmaWVkIGl0ZW1cbiAqIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGFycmF5LjRcbiAqIEBwYXJhbSB7Kn0gYXJyYXkgdGhlIGFycmF5IGluIHdoaWNoIHRvIHNlYXJjaCB0aGUgZWxlbWVudC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIHRoZSBlbGVtZW50IHRvIHNlYXJjaC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uIHVzZWQgdG9cbiAqIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gMiBlbGVtZW50cy5cbiAqIEByZXR1cm4ge251bWJlcn0gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIHRoZSBzcGVjaWZpZWQgZWxlbWVudFxuICogd2l0aGluIHRoZSBzcGVjaWZpZWQgYXJyYXksIG9yIC0xIGlmIG5vdCBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgaXRlbSwgZXF1YWxzRnVuY3Rpb24pIHtcbiAgICB2YXIgZXF1YWxzID0gZXF1YWxzRnVuY3Rpb24gfHwgdXRpbC5kZWZhdWx0RXF1YWxzO1xuICAgIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZXF1YWxzKGFycmF5W2ldLCBpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuZXhwb3J0cy5pbmRleE9mID0gaW5kZXhPZjtcbi8qKlxuICogUmV0dXJucyB0aGUgcG9zaXRpb24gb2YgdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcbiAqIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGFycmF5LlxuICogQHBhcmFtIHsqfSBhcnJheSB0aGUgYXJyYXkgaW4gd2hpY2ggdG8gc2VhcmNoIHRoZSBlbGVtZW50LlxuICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gdGhlIGVsZW1lbnQgdG8gc2VhcmNoLlxuICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdXNlZCB0b1xuICogY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiAyIGVsZW1lbnRzLlxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgcG9zaXRpb24gb2YgdGhlIGxhc3Qgb2NjdXJyZW5jZSBvZiB0aGUgc3BlY2lmaWVkIGVsZW1lbnRcbiAqIHdpdGhpbiB0aGUgc3BlY2lmaWVkIGFycmF5IG9yIC0xIGlmIG5vdCBmb3VuZC5cbiAqL1xuZnVuY3Rpb24gbGFzdEluZGV4T2YoYXJyYXksIGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSB7XG4gICAgdmFyIGVxdWFscyA9IGVxdWFsc0Z1bmN0aW9uIHx8IHV0aWwuZGVmYXVsdEVxdWFscztcbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSBsZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAoZXF1YWxzKGFycmF5W2ldLCBpdGVtKSkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuZXhwb3J0cy5sYXN0SW5kZXhPZiA9IGxhc3RJbmRleE9mO1xuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCBhcnJheSBjb250YWlucyB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG4gKiBAcGFyYW0geyp9IGFycmF5IHRoZSBhcnJheSBpbiB3aGljaCB0byBzZWFyY2ggdGhlIGVsZW1lbnQuXG4gKiBAcGFyYW0ge09iamVjdH0gaXRlbSB0aGUgZWxlbWVudCB0byBzZWFyY2guXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKE9iamVjdCxPYmplY3QpOmJvb2xlYW49fSBlcXVhbHNGdW5jdGlvbiBvcHRpb25hbCBmdW5jdGlvbiB0b1xuICogY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiAyIGVsZW1lbnRzLlxuICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIGFycmF5IGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gY29udGFpbnMoYXJyYXksIGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSB7XG4gICAgcmV0dXJuIGluZGV4T2YoYXJyYXksIGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSA+PSAwO1xufVxuZXhwb3J0cy5jb250YWlucyA9IGNvbnRhaW5zO1xuLyoqXG4gKiBSZW1vdmVzIHRoZSBmaXJzdCBvY3VycmVuY2Ugb2YgdGhlIHNwZWNpZmllZCBlbGVtZW50IGZyb20gdGhlIHNwZWNpZmllZCBhcnJheS5cbiAqIEBwYXJhbSB7Kn0gYXJyYXkgdGhlIGFycmF5IGluIHdoaWNoIHRvIHNlYXJjaCBlbGVtZW50LlxuICogQHBhcmFtIHtPYmplY3R9IGl0ZW0gdGhlIGVsZW1lbnQgdG8gc2VhcmNoLlxuICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdG9cbiAqIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gMiBlbGVtZW50cy5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IHRydWUgaWYgdGhlIGFycmF5IGNoYW5nZWQgYWZ0ZXIgdGhpcyBjYWxsLlxuICovXG5mdW5jdGlvbiByZW1vdmUoYXJyYXksIGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSB7XG4gICAgdmFyIGluZGV4ID0gaW5kZXhPZihhcnJheSwgaXRlbSwgZXF1YWxzRnVuY3Rpb24pO1xuICAgIGlmIChpbmRleCA8IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHJldHVybiB0cnVlO1xufVxuZXhwb3J0cy5yZW1vdmUgPSByZW1vdmU7XG4vKipcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGUgc3BlY2lmaWVkIGFycmF5IGVxdWFsXG4gKiB0byB0aGUgc3BlY2lmaWVkIG9iamVjdC5cbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IHRoZSBhcnJheSBpbiB3aGljaCB0byBkZXRlcm1pbmUgdGhlIGZyZXF1ZW5jeSBvZiB0aGUgZWxlbWVudC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBpdGVtIHRoZSBlbGVtZW50IHdob3NlIGZyZXF1ZW5jeSBpcyB0byBiZSBkZXRlcm1pbmVkLlxuICogQHBhcmFtIHtmdW5jdGlvbihPYmplY3QsT2JqZWN0KTpib29sZWFuPX0gZXF1YWxzRnVuY3Rpb24gb3B0aW9uYWwgZnVuY3Rpb24gdXNlZCB0b1xuICogY2hlY2sgZXF1YWxpdHkgYmV0d2VlbiAyIGVsZW1lbnRzLlxuICogQHJldHVybiB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIHRoZSBzcGVjaWZpZWQgYXJyYXlcbiAqIGVxdWFsIHRvIHRoZSBzcGVjaWZpZWQgb2JqZWN0LlxuICovXG5mdW5jdGlvbiBmcmVxdWVuY3koYXJyYXksIGl0ZW0sIGVxdWFsc0Z1bmN0aW9uKSB7XG4gICAgdmFyIGVxdWFscyA9IGVxdWFsc0Z1bmN0aW9uIHx8IHV0aWwuZGVmYXVsdEVxdWFscztcbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgIHZhciBmcmVxID0gMDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChlcXVhbHMoYXJyYXlbaV0sIGl0ZW0pKSB7XG4gICAgICAgICAgICBmcmVxKys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZyZXE7XG59XG5leHBvcnRzLmZyZXF1ZW5jeSA9IGZyZXF1ZW5jeTtcbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB0d28gc3BlY2lmaWVkIGFycmF5cyBhcmUgZXF1YWwgdG8gb25lIGFub3RoZXIuXG4gKiBUd28gYXJyYXlzIGFyZSBjb25zaWRlcmVkIGVxdWFsIGlmIGJvdGggYXJyYXlzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyXG4gKiBvZiBlbGVtZW50cywgYW5kIGFsbCBjb3JyZXNwb25kaW5nIHBhaXJzIG9mIGVsZW1lbnRzIGluIHRoZSB0d29cbiAqIGFycmF5cyBhcmUgZXF1YWwgYW5kIGFyZSBpbiB0aGUgc2FtZSBvcmRlci5cbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5MSBvbmUgYXJyYXkgdG8gYmUgdGVzdGVkIGZvciBlcXVhbGl0eS5cbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5MiB0aGUgb3RoZXIgYXJyYXkgdG8gYmUgdGVzdGVkIGZvciBlcXVhbGl0eS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0LE9iamVjdCk6Ym9vbGVhbj19IGVxdWFsc0Z1bmN0aW9uIG9wdGlvbmFsIGZ1bmN0aW9uIHVzZWQgdG9cbiAqIGNoZWNrIGVxdWFsaXR5IGJldHdlZW4gZWxlbWVtZW50cyBpbiB0aGUgYXJyYXlzLlxuICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgdHdvIGFycmF5cyBhcmUgZXF1YWxcbiAqL1xuZnVuY3Rpb24gZXF1YWxzKGFycmF5MSwgYXJyYXkyLCBlcXVhbHNGdW5jdGlvbikge1xuICAgIHZhciBlcXVhbHMgPSBlcXVhbHNGdW5jdGlvbiB8fCB1dGlsLmRlZmF1bHRFcXVhbHM7XG4gICAgaWYgKGFycmF5MS5sZW5ndGggIT09IGFycmF5Mi5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkxLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghZXF1YWxzKGFycmF5MVtpXSwgYXJyYXkyW2ldKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuZXhwb3J0cy5lcXVhbHMgPSBlcXVhbHM7XG4vKipcbiAqIFJldHVybnMgc2hhbGxvdyBhIGNvcHkgb2YgdGhlIHNwZWNpZmllZCBhcnJheS5cbiAqIEBwYXJhbSB7Kn0gYXJyYXkgdGhlIGFycmF5IHRvIGNvcHkuXG4gKiBAcmV0dXJuIHtBcnJheX0gYSBjb3B5IG9mIHRoZSBzcGVjaWZpZWQgYXJyYXlcbiAqL1xuZnVuY3Rpb24gY29weShhcnJheSkge1xuICAgIHJldHVybiBhcnJheS5jb25jYXQoKTtcbn1cbmV4cG9ydHMuY29weSA9IGNvcHk7XG4vKipcbiAqIFN3YXBzIHRoZSBlbGVtZW50cyBhdCB0aGUgc3BlY2lmaWVkIHBvc2l0aW9ucyBpbiB0aGUgc3BlY2lmaWVkIGFycmF5LlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IGluIHdoaWNoIHRvIHN3YXAgZWxlbWVudHMuXG4gKiBAcGFyYW0ge251bWJlcn0gaSB0aGUgaW5kZXggb2Ygb25lIGVsZW1lbnQgdG8gYmUgc3dhcHBlZC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBqIHRoZSBpbmRleCBvZiB0aGUgb3RoZXIgZWxlbWVudCB0byBiZSBzd2FwcGVkLlxuICogQHJldHVybiB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgYXJyYXkgaXMgZGVmaW5lZCBhbmQgdGhlIGluZGV4ZXMgYXJlIHZhbGlkLlxuICovXG5mdW5jdGlvbiBzd2FwKGFycmF5LCBpLCBqKSB7XG4gICAgaWYgKGkgPCAwIHx8IGkgPj0gYXJyYXkubGVuZ3RoIHx8IGogPCAwIHx8IGogPj0gYXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHRlbXAgPSBhcnJheVtpXTtcbiAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgIGFycmF5W2pdID0gdGVtcDtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmV4cG9ydHMuc3dhcCA9IHN3YXA7XG5mdW5jdGlvbiB0b1N0cmluZyhhcnJheSkge1xuICAgIHJldHVybiAnWycgKyBhcnJheS50b1N0cmluZygpICsgJ10nO1xufVxuZXhwb3J0cy50b1N0cmluZyA9IHRvU3RyaW5nO1xuLyoqXG4gKiBFeGVjdXRlcyB0aGUgcHJvdmlkZWQgZnVuY3Rpb24gb25jZSBmb3IgZWFjaCBlbGVtZW50IHByZXNlbnQgaW4gdGhpcyBhcnJheVxuICogc3RhcnRpbmcgZnJvbSBpbmRleCAwIHRvIGxlbmd0aCAtIDEuXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgaW4gd2hpY2ggdG8gaXRlcmF0ZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb24oT2JqZWN0KToqfSBjYWxsYmFjayBmdW5jdGlvbiB0byBleGVjdXRlLCBpdCBpc1xuICogaW52b2tlZCB3aXRoIG9uZSBhcmd1bWVudDogdGhlIGVsZW1lbnQgdmFsdWUsIHRvIGJyZWFrIHRoZSBpdGVyYXRpb24geW91IGNhblxuICogb3B0aW9uYWxseSByZXR1cm4gZmFsc2UuXG4gKi9cbmZ1bmN0aW9uIGZvckVhY2goYXJyYXksIGNhbGxiYWNrKSB7XG4gICAgZm9yICh2YXIgX2kgPSAwLCBhcnJheV8xID0gYXJyYXk7IF9pIDwgYXJyYXlfMS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFyIGVsZSA9IGFycmF5XzFbX2ldO1xuICAgICAgICBpZiAoY2FsbGJhY2soZWxlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuZm9yRWFjaCA9IGZvckVhY2g7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcnJheXMuanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLyBDb3B5cmlnaHQgMjAxMyBCYXNhcmF0IEFsaSBTeWVkLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuLy9cbi8vIExpY2Vuc2VkIHVuZGVyIE1JVCBvcGVuIHNvdXJjZSBsaWNlbnNlIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbi8vXG4vLyBPcmdpbmFsIGphdmFzY3JpcHQgY29kZSB3YXMgYnkgTWF1cmljaW8gU2FudG9zXG4vL1xudmFyIF9hcnJheXMgPSByZXF1aXJlKFwiLi9hcnJheXNcIik7XG5leHBvcnRzLmFycmF5cyA9IF9hcnJheXM7XG52YXIgQmFnXzEgPSByZXF1aXJlKFwiLi9CYWdcIik7XG5leHBvcnRzLkJhZyA9IEJhZ18xLmRlZmF1bHQ7XG52YXIgQlNUcmVlXzEgPSByZXF1aXJlKFwiLi9CU1RyZWVcIik7XG5leHBvcnRzLkJTVHJlZSA9IEJTVHJlZV8xLmRlZmF1bHQ7XG52YXIgQlNUcmVlS1ZfMSA9IHJlcXVpcmUoXCIuL0JTVHJlZUtWXCIpO1xuZXhwb3J0cy5CU1RyZWVLViA9IEJTVHJlZUtWXzEuZGVmYXVsdDtcbnZhciBEaWN0aW9uYXJ5XzEgPSByZXF1aXJlKFwiLi9EaWN0aW9uYXJ5XCIpO1xuZXhwb3J0cy5EaWN0aW9uYXJ5ID0gRGljdGlvbmFyeV8xLmRlZmF1bHQ7XG52YXIgSGVhcF8xID0gcmVxdWlyZShcIi4vSGVhcFwiKTtcbmV4cG9ydHMuSGVhcCA9IEhlYXBfMS5kZWZhdWx0O1xudmFyIExpbmtlZERpY3Rpb25hcnlfMSA9IHJlcXVpcmUoXCIuL0xpbmtlZERpY3Rpb25hcnlcIik7XG5leHBvcnRzLkxpbmtlZERpY3Rpb25hcnkgPSBMaW5rZWREaWN0aW9uYXJ5XzEuZGVmYXVsdDtcbnZhciBMaW5rZWRMaXN0XzEgPSByZXF1aXJlKFwiLi9MaW5rZWRMaXN0XCIpO1xuZXhwb3J0cy5MaW5rZWRMaXN0ID0gTGlua2VkTGlzdF8xLmRlZmF1bHQ7XG52YXIgTXVsdGlEaWN0aW9uYXJ5XzEgPSByZXF1aXJlKFwiLi9NdWx0aURpY3Rpb25hcnlcIik7XG5leHBvcnRzLk11bHRpRGljdGlvbmFyeSA9IE11bHRpRGljdGlvbmFyeV8xLmRlZmF1bHQ7XG52YXIgRmFjdG9yeURpY3Rpb25hcnlfMSA9IHJlcXVpcmUoXCIuL0ZhY3RvcnlEaWN0aW9uYXJ5XCIpO1xuZXhwb3J0cy5GYWN0b3J5RGljdGlvbmFyeSA9IEZhY3RvcnlEaWN0aW9uYXJ5XzEuZGVmYXVsdDtcbnZhciBGYWN0b3J5RGljdGlvbmFyeV8yID0gcmVxdWlyZShcIi4vRmFjdG9yeURpY3Rpb25hcnlcIik7XG5leHBvcnRzLkRlZmF1bHREaWN0aW9uYXJ5ID0gRmFjdG9yeURpY3Rpb25hcnlfMi5kZWZhdWx0O1xudmFyIFF1ZXVlXzEgPSByZXF1aXJlKFwiLi9RdWV1ZVwiKTtcbmV4cG9ydHMuUXVldWUgPSBRdWV1ZV8xLmRlZmF1bHQ7XG52YXIgUHJpb3JpdHlRdWV1ZV8xID0gcmVxdWlyZShcIi4vUHJpb3JpdHlRdWV1ZVwiKTtcbmV4cG9ydHMuUHJpb3JpdHlRdWV1ZSA9IFByaW9yaXR5UXVldWVfMS5kZWZhdWx0O1xudmFyIFNldF8xID0gcmVxdWlyZShcIi4vU2V0XCIpO1xuZXhwb3J0cy5TZXQgPSBTZXRfMS5kZWZhdWx0O1xudmFyIFN0YWNrXzEgPSByZXF1aXJlKFwiLi9TdGFja1wiKTtcbmV4cG9ydHMuU3RhY2sgPSBTdGFja18xLmRlZmF1bHQ7XG52YXIgTXVsdGlSb290VHJlZV8xID0gcmVxdWlyZShcIi4vTXVsdGlSb290VHJlZVwiKTtcbmV4cG9ydHMuTXVsdGlSb290VHJlZSA9IE11bHRpUm9vdFRyZWVfMS5kZWZhdWx0O1xudmFyIF91dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbmV4cG9ydHMudXRpbCA9IF91dGlsO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgX2hhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbmV4cG9ydHMuaGFzID0gZnVuY3Rpb24gKG9iaiwgcHJvcCkge1xuICAgIHJldHVybiBfaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufTtcbi8qKlxuICogRGVmYXVsdCBmdW5jdGlvbiB0byBjb21wYXJlIGVsZW1lbnQgb3JkZXIuXG4gKiBAZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gZGVmYXVsdENvbXBhcmUoYSwgYikge1xuICAgIGlmIChhIDwgYikge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuICAgIGVsc2UgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gMTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHRDb21wYXJlID0gZGVmYXVsdENvbXBhcmU7XG4vKipcbiAqIERlZmF1bHQgZnVuY3Rpb24gdG8gdGVzdCBlcXVhbGl0eS5cbiAqIEBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBkZWZhdWx0RXF1YWxzKGEsIGIpIHtcbiAgICByZXR1cm4gYSA9PT0gYjtcbn1cbmV4cG9ydHMuZGVmYXVsdEVxdWFscyA9IGRlZmF1bHRFcXVhbHM7XG4vKipcbiAqIERlZmF1bHQgZnVuY3Rpb24gdG8gY29udmVydCBhbiBvYmplY3QgdG8gYSBzdHJpbmcuXG4gKiBAZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gZGVmYXVsdFRvU3RyaW5nKGl0ZW0pIHtcbiAgICBpZiAoaXRlbSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gJ0NPTExFQ1RJT05fTlVMTCc7XG4gICAgfVxuICAgIGVsc2UgaWYgKGlzVW5kZWZpbmVkKGl0ZW0pKSB7XG4gICAgICAgIHJldHVybiAnQ09MTEVDVElPTl9VTkRFRklORUQnO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc1N0cmluZyhpdGVtKSkge1xuICAgICAgICByZXR1cm4gJyRzJyArIGl0ZW07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gJyRvJyArIGl0ZW0udG9TdHJpbmcoKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHRUb1N0cmluZyA9IGRlZmF1bHRUb1N0cmluZztcbi8qKlxuICogSm9pbnMgYWxsIHRoZSBwcm9wZXJpZXMgb2YgdGhlIG9iamVjdCB1c2luZyB0aGUgcHJvdmlkZWQgam9pbiBzdHJpbmdcbiAqL1xuZnVuY3Rpb24gbWFrZVN0cmluZyhpdGVtLCBqb2luKSB7XG4gICAgaWYgKGpvaW4gPT09IHZvaWQgMCkgeyBqb2luID0gJywnOyB9XG4gICAgaWYgKGl0ZW0gPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuICdDT0xMRUNUSU9OX05VTEwnO1xuICAgIH1cbiAgICBlbHNlIGlmIChpc1VuZGVmaW5lZChpdGVtKSkge1xuICAgICAgICByZXR1cm4gJ0NPTExFQ1RJT05fVU5ERUZJTkVEJztcbiAgICB9XG4gICAgZWxzZSBpZiAoaXNTdHJpbmcoaXRlbSkpIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0udG9TdHJpbmcoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciB0b3JldCA9ICd7JztcbiAgICAgICAgdmFyIGZpcnN0ID0gdHJ1ZTtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBpdGVtKSB7XG4gICAgICAgICAgICBpZiAoZXhwb3J0cy5oYXMoaXRlbSwgcHJvcCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZmlyc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlyc3QgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcmV0ID0gdG9yZXQgKyBqb2luO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0b3JldCA9IHRvcmV0ICsgcHJvcCArICc6JyArIGl0ZW1bcHJvcF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvcmV0ICsgJ30nO1xuICAgIH1cbn1cbmV4cG9ydHMubWFrZVN0cmluZyA9IG1ha2VTdHJpbmc7XG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gYXJndW1lbnQgaXMgYSBmdW5jdGlvbi5cbiAqIEBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGZ1bmMpIHtcbiAgICByZXR1cm4gKHR5cGVvZiBmdW5jKSA9PT0gJ2Z1bmN0aW9uJztcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG4vKipcbiAqIENoZWNrcyBpZiB0aGUgZ2l2ZW4gYXJndW1lbnQgaXMgdW5kZWZpbmVkLlxuICogQGZ1bmN0aW9uXG4gKi9cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKG9iaikge1xuICAgIHJldHVybiAodHlwZW9mIG9iaikgPT09ICd1bmRlZmluZWQnO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50IGlzIGEgc3RyaW5nLlxuICogQGZ1bmN0aW9uXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKG9iaikge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgU3RyaW5nXSc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG4vKipcbiAqIFJldmVyc2VzIGEgY29tcGFyZSBmdW5jdGlvbi5cbiAqIEBmdW5jdGlvblxuICovXG5mdW5jdGlvbiByZXZlcnNlQ29tcGFyZUZ1bmN0aW9uKGNvbXBhcmVGdW5jdGlvbikge1xuICAgIGlmIChpc1VuZGVmaW5lZChjb21wYXJlRnVuY3Rpb24pIHx8ICFpc0Z1bmN0aW9uKGNvbXBhcmVGdW5jdGlvbikpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICBpZiAoYSA8IGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZCwgdikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXBhcmVGdW5jdGlvbihkLCB2KSAqIC0xO1xuICAgICAgICB9O1xuICAgIH1cbn1cbmV4cG9ydHMucmV2ZXJzZUNvbXBhcmVGdW5jdGlvbiA9IHJldmVyc2VDb21wYXJlRnVuY3Rpb247XG4vKipcbiAqIFJldHVybnMgYW4gZXF1YWwgZnVuY3Rpb24gZ2l2ZW4gYSBjb21wYXJlIGZ1bmN0aW9uLlxuICogQGZ1bmN0aW9uXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVUb0VxdWFscyhjb21wYXJlRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGNvbXBhcmVGdW5jdGlvbihhLCBiKSA9PT0gMDtcbiAgICB9O1xufVxuZXhwb3J0cy5jb21wYXJlVG9FcXVhbHMgPSBjb21wYXJlVG9FcXVhbHM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlsLmpzLm1hcCIsImltcG9ydCB7IERldmljZUludGVyZmFjZSB9IGZyb20gJy4vRGV2aWNlSW50ZXJmYWNlJztcclxuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi9Mb2dnZXInO1xyXG5cclxuYWJzdHJhY3QgY2xhc3MgRGV2aWNlIGltcGxlbWVudHMgRGV2aWNlSW50ZXJmYWNlIHtcclxuICBwcm90ZWN0ZWQgc3RhdGU6IGJvb2xlYW4gPSBmYWxzZTtcclxuICBwcm90ZWN0ZWQgdGltZXI6IE5vZGVKUy5UaW1lb3V0O1xyXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgbmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgIH1cclxuXHJcbiAgb24oKTogdm9pZCB7XHJcbiAgICB0aGlzLnN0YXRlID0gdHJ1ZTtcclxuICB9XHJcblxyXG4gIG9mZigpOiB2b2lkIHtcclxuICAgIHRoaXMuc3RhdGUgPSBmYWxzZTtcclxuICB9XHJcbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBgXHJcbiAgICAgICAgICAgIG5hbWU6ICR7dGhpcy5nZXROYW1lKCl9LFxyXG4gICAgICAgICAgICBzdGF0dXM6ICR7dGhpcy5nZXRTdGF0ZSgpfSxcclxuICAgICAgICAgICAgYDtcclxuICB9XHJcblxyXG4gIGdldE5hbWUoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLm5hbWU7XHJcbiAgfVxyXG5cclxuICBnZXRTdGF0ZSgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLnN0YXRlO1xyXG4gIH1cclxuXHJcbiAgc2V0TmFtZShuYW1lOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmNoZWNrTmFtZVZhbGlkaXR5KG5hbWUpKSB7XHJcbiAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcm90ZWN0ZWQgaXNEZXZpY2VPbigpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLnN0YXRlICE9PSBmYWxzZTtcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBjaGVja05hbWVWYWxpZGl0eShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIG5hbWUgPSBuYW1lLnRyaW0oKTtcclxuICAgIGNvbnN0IHJlZ2V4OiBSZWdFeHAgPSAvW1xcd1xcZFxcc117NSwxMH0vO1xyXG4gICAgaWYgKCFyZWdleC50ZXN0KG5hbWUpKSB7XHJcbiAgICAgIGxvZy5lcnJvcignTmFtZSBtdXN0IGluY2x1ZGUgbW9yZSB0aGFuIDUgY2hhcmFjdGVycycpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHByb3RlY3RlZCBkZWxldGVUaW1lcigpOiB2b2lkIHtcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy50aW1lcik7XHJcbiAgfVxyXG59XHJcbmV4cG9ydCB7IERldmljZSB9O1xyXG4iLCIvKlxyXG5leHBvcnQgY29uc3QgTG9nZ2VyID0ge1xyXG4gIHdhcm5pbmc6IGZ1bmN0aW9uKHRleHQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgY29uc29sZS53YXJuKHRleHQpO1xyXG4gIH0sXHJcbiAgZXJyb3I6IGZ1bmN0aW9uKHRleHQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgY29uc29sZS5lcnJvcih0ZXh0KTtcclxuICB9XHJcbn07XHJcbiovXHJcbmNvbnN0IExvZ2dlciA9IHJlcXVpcmUoJ2xvZ2dlci1ub2RlanMnKTtcclxuY29uc3QgbG9nID0gbmV3IExvZ2dlcigpO1xyXG5leHBvcnQge2xvZ307XHJcbiIsImltcG9ydCAqIGFzIENvbGxlY3Rpb25zIGZyb20gJ3R5cGVzY3JpcHQtY29sbGVjdGlvbnMnO1xyXG5pbXBvcnQgeyBEZXZpY2VJbnRlcmZhY2UgfSBmcm9tICcuL0RldmljZUludGVyZmFjZSc7XHJcbmltcG9ydCB7IGlLZXR0bGUgfSBmcm9tICcuL2lLZXR0bGUnO1xyXG5pbXBvcnQgeyBTcGVha2VyIH0gZnJvbSAnLi9TcGVha2VyJztcclxuaW1wb3J0IHsgc3RyaWN0IH0gZnJvbSAnYXNzZXJ0JztcclxuaW1wb3J0IHsgRGV2aWNlIH0gZnJvbSAnLi9EZXZpY2UnO1xyXG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuL0xvZ2dlcic7XHJcbmltcG9ydCBEaWN0aW9uYXJ5IGZyb20gJ3R5cGVzY3JpcHQtY29sbGVjdGlvbnMvZGlzdC9saWIvRGljdGlvbmFyeSc7XHJcblxyXG5leHBvcnQgY2xhc3MgU21hcnRIb3VzZTxUIGV4dGVuZHMgRGV2aWNlSW50ZXJmYWNlPiB7XHJcbiAgcHJvdGVjdGVkIGRldmljZXMgPSBuZXcgQ29sbGVjdGlvbnMuRGljdGlvbmFyeTxzdHJpbmcsIFQ+KCk7XHJcbiAgcHJvdGVjdGVkIG5hbWU6IHN0cmluZztcclxuICBjb25zdHJ1Y3RvcihuYW1lSG91c2U6IHN0cmluZykge1xyXG4gICAgaWYgKHRoaXMuX2NoZWNrTmFtZShuYW1lSG91c2UpKSB7XHJcbiAgICAgIHRoaXMubmFtZSA9IG5hbWVIb3VzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgX2NoZWNrTmFtZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIG5hbWUgPSBuYW1lLnRyaW0oKTtcclxuICAgIGNvbnN0IHJlZ2V4ID0gL1tcXHdcXGRcXHNdezUsMTB9LztcclxuICAgIGlmICghcmVnZXgudGVzdChuYW1lKSkge1xyXG4gICAgICBsb2cud2FybignTmFtZSBtdXN0IGluY2x1ZGUgbW9yZSB0aGFuIDUgY2hhcmFjdGVycycpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbiAgb25BbGwoKTogdm9pZCB7XHJcbiAgICBmb3IgKGxldCB2YWwgb2YgdGhpcy5kZXZpY2VzLnZhbHVlcygpKSB7XHJcbiAgICAgIHZhbC5vbigpO1xyXG4gICAgfVxyXG4gIH1cclxuICBvZmZBbGwoKTogdm9pZCB7XHJcbiAgICBmb3IgKGxldCB2YWwgb2YgdGhpcy5kZXZpY2VzLnZhbHVlcygpKSB7XHJcbiAgICAgIHZhbC5vZmYoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRlbGV0ZUFsbERldmljZXMoKSB7XHJcbiAgICB0aGlzLm9mZkFsbCgpO1xyXG4gICAgdGhpcy5kZXZpY2VzLmNsZWFyKCk7XHJcbiAgfVxyXG5cclxuICBnZXREZXZpY2VCeU5hbWUobmFtZTogc3RyaW5nKTogVCB8IG51bGwge1xyXG4gICAgaWYgKHRoaXMuZGV2aWNlcy5jb250YWluc0tleShuYW1lKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5kZXZpY2VzLmdldFZhbHVlKG5hbWUpO1xyXG4gICAgfVxyXG4gICAgbG9nLndhcm4oJ1RoZXJlIGlzIG5vIGRldmljZSB3aXRoIHRoaXMgbmFtZScpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG4gIGdldEFsbERldmljZXNCeU1vZGVsKG1vZGVsOiBGdW5jdGlvbik6IEFycmF5PFQ+IHtcclxuICAgIGxldCByZXN1bHREZXZpY2VzOiBBcnJheTxUPiA9IFtdO1xyXG4gICAgZm9yIChsZXQgdmFsIG9mIHRoaXMuZGV2aWNlcy52YWx1ZXMoKSkge1xyXG4gICAgICBpZiAodmFsIGluc3RhbmNlb2YgbW9kZWwpIHtcclxuICAgICAgICByZXN1bHREZXZpY2VzLnB1c2godmFsKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJlc3VsdERldmljZXM7XHJcbiAgfVxyXG5cclxuICBkZWxldGVEZXZpY2VzQnlNb2RlbChtb2RlbDogRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgIGZvciAobGV0IGtleSBvZiB0aGlzLmRldmljZXMua2V5cygpKSB7XHJcbiAgICAgIGlmICh0aGlzLmRldmljZXMuZ2V0VmFsdWUoa2V5KSBpbnN0YW5jZW9mIG1vZGVsKSB7XHJcbiAgICAgICAgdGhpcy5kZXZpY2VzLnJlbW92ZShrZXkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9pc05hbWVVbmlxdWUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gIXRoaXMuZGV2aWNlcy5jb250YWluc0tleShuYW1lKTtcclxuICB9XHJcblxyXG4gIGdldE5hbWUoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiB0aGlzLm5hbWU7XHJcbiAgfVxyXG5cclxuICBhZGREZXZpY2Uob2JqOiBUKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5faXNOYW1lVW5pcXVlKG9iai5nZXROYW1lKCkpKSB7XHJcbiAgICAgIHRoaXMuZGV2aWNlcy5zZXRWYWx1ZShvYmouZ2V0TmFtZSgpLCBvYmopO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZGVsZXRlRGV2aWNlQnlOYW1lKG5hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5kZXZpY2VzLnJlbW92ZShuYW1lKTtcclxuICB9XHJcbiAgZ2V0QWxsRGV2aWNlcygpOiBEaWN0aW9uYXJ5PHN0cmluZywgVD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuZGV2aWNlcztcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRGV2aWNlIH0gZnJvbSAnLi9EZXZpY2UnO1xyXG5pbXBvcnQgeyBEZXZpY2VJbnRlcmZhY2UgfSBmcm9tICcuL0RldmljZUludGVyZmFjZSc7XHJcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4vTG9nZ2VyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBTcGVha2VyIGV4dGVuZHMgRGV2aWNlIHtcclxuICBwcm90ZWN0ZWQgcGxheWJhY2tTdGF0ZTogYm9vbGVhbiA9IGZhbHNlO1xyXG4gIHByb3RlY3RlZCB2b2x1bWVNaW46IG51bWJlciA9IDA7XHJcbiAgcHJvdGVjdGVkIHZvbHVtZU1heDogbnVtYmVyID0gMTA7XHJcbiAgcHJvdGVjdGVkIGN1cnJlbnRWb2x1bWU6IG51bWJlciA9IDU7XHJcbiAgcHJvdGVjdGVkIGN1cnJlbnRUaW1lclZhbHVlOiBudW1iZXIgPSAwO1xyXG4gIHByb3RlY3RlZCBjdXJyZW50VHJhY2s6IG51bWJlciA9IDA7XHJcbiAgcHJvdGVjdGVkIHRyYWNrTGlzdDogQXJyYXk8b2JqZWN0PiA9IFtcclxuICAgIHtcclxuICAgICAgbmFtZTogJ1NvbmcgMScsXHJcbiAgICAgIGR1cmF0aW9uOiA4XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAnU29uZyAyJyxcclxuICAgICAgZHVyYXRpb246IDEwXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAnU29uZyAzJyxcclxuICAgICAgZHVyYXRpb246IDVcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdTb25nIDQnLFxyXG4gICAgICBkdXJhdGlvbjogMTNcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdTb25nIDUnLFxyXG4gICAgICBkdXJhdGlvbjogMTBcclxuICAgIH1cclxuICBdO1xyXG5cclxuICBvZmYoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5pc0RldmljZU9uKCkpIHtcclxuICAgICAgdGhpcy50b2dnbGVQbGF5YmFja1N0YXR1cyhmYWxzZSk7XHJcbiAgICAgIHRoaXMuY3VycmVudFRpbWVyVmFsdWUgPSAwO1xyXG4gICAgICB0aGlzLmN1cnJlbnRUcmFjayA9IDA7XHJcbiAgICAgIHRoaXMuY3VycmVudFZvbHVtZSA9IDU7XHJcbiAgICAgIHN1cGVyLm9mZigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gbG9nIGluZm8gYWJvdXQgY3VycmVudCBkZXZpY2Ugc3RhdGVcclxuICB0b1N0cmluZygpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGBcclxuICAgICAgICAke3N1cGVyLnRvU3RyaW5nKCl9LFxyXG4gICAgICAgIHZvbHVtZTogJHt0aGlzLmN1cnJlbnRWb2x1bWV9LFxyXG4gICAgICAgIHBsYXlpbmc6ICR7dGhpcy5wbGF5YmFja1N0YXRlID8gJ1BsYXknIDogJ1BhdXNlJ30sXHJcbiAgICAgICAgY3VycmVudFNvbmc6ICR7T2JqZWN0LmtleXModGhpcy50cmFja0xpc3RbdGhpcy5jdXJyZW50VHJhY2tdKVswXX0sXHJcbiAgICAgICAgc29uZ0R1cmF0aW9uOiAke09iamVjdC5rZXlzKHRoaXMudHJhY2tMaXN0W3RoaXMuY3VycmVudFRyYWNrXSlbMV19cyxcclxuICAgICAgICBjdXJyZW50VGltZTogJHt0aGlzLmN1cnJlbnRUaW1lclZhbHVlfXNcclxuYDtcclxuICB9XHJcblxyXG4gIC8vIHR1cm4gZGV2aWNlIHRvIHBsYXkvcGF1c2UgbW9kZXNcclxuICB0b2dnbGVQbGF5YmFja1N0YXR1cyhzdGF0dXM6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmlzRGV2aWNlT24oKSkge1xyXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMucGxheWJhY2tTdGF0ZSA9IHN0YXR1cztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnBsYXliYWNrU3RhdGUgPSAhdGhpcy5wbGF5YmFja1N0YXRlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnBsYXliYWNrU3RhdGUpIHtcclxuICAgICAgICB0aGlzLl9zdGFydFBsYXlpbmcodGhpcy5jdXJyZW50VGltZXJWYWx1ZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5fc3RvcFBsYXlpbmcoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfc3RvcFBsYXlpbmcoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5pc0RldmljZU9uKCkpIHtcclxuICAgICAgdGhpcy5kZWxldGVUaW1lcigpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBfc3RhcnRQbGF5aW5nKHBsYXlTb25nRnJvbTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5pc0RldmljZU9uKCkgJiYgdGhpcy5faXNEZXZpY2VJblBsYXlpbmdNb2RlTm93KCkpIHtcclxuICAgICAgbGV0IGNvdW50ID0gcGxheVNvbmdGcm9tO1xyXG5cclxuICAgICAgbGV0IHRpYyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChjb3VudCA+PSBPYmplY3QudmFsdWVzKHRoaXMudHJhY2tMaXN0W3RoaXMuY3VycmVudFRyYWNrXSlbMV0pIHtcclxuICAgICAgICAgIHRoaXMubmV4dFRyYWNrKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvdW50Kys7XHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRUaW1lclZhbHVlID0gY291bnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKHRpYy5iaW5kKHRoaXMpLCAxMDAwKTtcclxuICAgIH1cclxuICB9XHJcbiAgZ2V0UGxheVBhdXNlU3RhdGUoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5wbGF5YmFja1N0YXRlO1xyXG4gIH1cclxuXHJcbiAgbmV4dFRyYWNrKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuY3VycmVudFRyYWNrIDwgdGhpcy50cmFja0xpc3QubGVuZ3RoIC0gMSkge1xyXG4gICAgICB0aGlzLmN1cnJlbnRUcmFjaysrO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5jdXJyZW50VHJhY2sgPSAwO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJldmlvdXNUcmFjaygpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmN1cnJlbnRUcmFjayA+IDApIHtcclxuICAgICAgdGhpcy5jdXJyZW50VHJhY2stLTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuY3VycmVudFRyYWNrID0gdGhpcy50cmFja0xpc3QubGVuZ3RoIC0gMTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV3aW5kRm9yd2FyZCh0aW1lOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmIChcclxuICAgICAgdGhpcy5jdXJyZW50VGltZXJWYWx1ZSArIHRpbWUgPFxyXG4gICAgICBPYmplY3QudmFsdWVzKHRoaXMudHJhY2tMaXN0W3RoaXMuY3VycmVudFRyYWNrXSlbMV1cclxuICAgICkge1xyXG4gICAgICB0aGlzLl9zdG9wUGxheWluZygpO1xyXG4gICAgICB0aGlzLl9zdGFydFBsYXlpbmcodGhpcy5jdXJyZW50VGltZXJWYWx1ZSArIHRpbWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5uZXh0VHJhY2soKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJld2luZEJhY2sodGltZTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICB0aGlzLl9zdG9wUGxheWluZygpO1xyXG4gICAgaWYgKHRoaXMuY3VycmVudFRpbWVyVmFsdWUgLSB0aW1lID4gMCkge1xyXG4gICAgICB0aGlzLl9zdGFydFBsYXlpbmcodGhpcy5jdXJyZW50VGltZXJWYWx1ZSAtIHRpbWUpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5uZXh0VHJhY2soKTtcclxuICAgIH1cclxuICB9XHJcbiAgaW5jcmVhc2VWb2x1bWUoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5pc0RldmljZU9uKCkpIHtcclxuICAgICAgaWYgKHRoaXMuY3VycmVudFZvbHVtZSA8IHRoaXMudm9sdW1lTWF4KSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50Vm9sdW1lKys7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRlY3JlYXNlVm9sdW1lKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuaXNEZXZpY2VPbigpKSB7XHJcbiAgICAgIGlmICh0aGlzLmN1cnJlbnRWb2x1bWUgPiB0aGlzLnZvbHVtZU1pbikge1xyXG4gICAgICAgIHRoaXMuY3VycmVudFZvbHVtZS0tO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIF9pc0RldmljZUluUGxheWluZ01vZGVOb3coKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXRoaXMucGxheWJhY2tTdGF0ZSkge1xyXG4gICAgICBsb2cud2FybihcclxuICAgICAgICAnVG9nZ2xlIGRldmljZSB0byBwbGF5aW5nIG1vZGUgYmVmb3JlIHN0YXJ0aW5nIHRoaXMgb3BlcmF0aW9uJ1xyXG4gICAgICApO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgRGV2aWNlIH0gZnJvbSAnLi9EZXZpY2UnO1xyXG5pbXBvcnQgeyBEZXZpY2VJbnRlcmZhY2UgfSBmcm9tICcuL0RldmljZUludGVyZmFjZSc7XHJcbmltcG9ydCB7IGxvZyB9IGZyb20gJy4vTG9nZ2VyJztcclxuXHJcbmV4cG9ydCBjbGFzcyBpS2V0dGxlIGV4dGVuZHMgRGV2aWNlIHtcclxuICBwcm90ZWN0ZWQgY3VycmVudE1vZGU6IG51bWJlciA9IDA7XHJcbiAgcHJvdGVjdGVkIG1heEZ1bGxuZXNzOiBudW1iZXIgPSAxMDAwO1xyXG4gIHByb3RlY3RlZCBtaW5GdWxsbmVzczogbnVtYmVyID0gMTAwO1xyXG4gIHByb3RlY3RlZCBjdXJyZW50RnVsbG5lc3M6IG51bWJlciA9IDA7XHJcbiAgcHJvdGVjdGVkIGN1cnJlbnRUZW1wZXJhdHVyZTogbnVtYmVyID0gMjg7XHJcblxyXG4gIHByb3RlY3RlZCBtb2RlczogQXJyYXk8b2JqZWN0PiA9IFtcclxuICAgIHsgc3RhbmRhcmQ6IDEwMCB9LFxyXG4gICAgeyB0ZWE6IDc4IH0sXHJcbiAgICB7IGNvZmZlZTogODUgfSxcclxuICAgIHsgcG9ycmlkZ2U6IDcyIH0sXHJcbiAgICB7ICdiYWJ5IGZvb2QnOiA3MCB9XHJcbiAgXTtcclxuICBvZmYoKTogdm9pZCB7XHJcbiAgICBzdXBlci5vZmYoKTtcclxuICAgIHRoaXMuZGVsZXRlVGltZXIoKTtcclxuICAgIHRoaXMuY3VycmVudFRlbXBlcmF0dXJlID0gMjY7XHJcbiAgfVxyXG5cclxuICB0b1N0cmluZygpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGBcclxuICAgICAgICAgICAke3N1cGVyLnRvU3RyaW5nKCl9O1xyXG4gICAgICAgICAgIG1vZGU6ICR7dGhpcy5nZXRDdXJyZW50TW9kZSgpfSxcclxuICAgICAgICAgICBjdXJyZW50RnVsbG5lc3M6ICR7dGhpcy5nZXRDdXJyZW50RnVsbG5lc3MoKX1gO1xyXG4gIH1cclxuICBuZXh0TW9kZSgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmN1cnJlbnRNb2RlID09PSB0aGlzLm1vZGVzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgdGhpcy5jdXJyZW50TW9kZSA9IDA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGlzLmN1cnJlbnRNb2RlKys7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwcmV2aW91c01vZGUoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5jdXJyZW50TW9kZSA9PT0gMCkge1xyXG4gICAgICB0aGlzLmN1cnJlbnRNb2RlID0gdGhpcy5tb2Rlcy5sZW5ndGggLSAxO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5jdXJyZW50TW9kZS0tO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0Q3VycmVudE1vZGUoKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLm1vZGVzW3RoaXMuY3VycmVudE1vZGVdKVswXTtcclxuICB9XHJcblxyXG4gIGFkZFdhdGVyKHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGxldCBuZXdBbW91bnRPZldhdGVyID0gdGhpcy5jdXJyZW50RnVsbG5lc3MgKyB2YWx1ZTtcclxuICAgIGlmIChcclxuICAgICAgbmV3QW1vdW50T2ZXYXRlciA+PSB0aGlzLm1pbkZ1bGxuZXNzICYmXHJcbiAgICAgIG5ld0Ftb3VudE9mV2F0ZXIgPD0gdGhpcy5tYXhGdWxsbmVzc1xyXG4gICAgKSB7XHJcbiAgICAgIHRoaXMuY3VycmVudEZ1bGxuZXNzID0gbmV3QW1vdW50T2ZXYXRlcjtcclxuICAgIH0gZWxzZSBpZiAobmV3QW1vdW50T2ZXYXRlciA8IHRoaXMubWluRnVsbG5lc3MpIHtcclxuICAgICAgbG9nLndhcm4oJ1BsZWFzZSwgYWRkIG1vcmUgd2F0ZXInKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxvZy53YXJuKCdQbGVhc2UsIHJlZHVjZSB0aGUgYW1vdW50IG9mIHdhdGVyJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRDdXJyZW50RnVsbG5lc3MoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRGdWxsbmVzcztcclxuICB9XHJcblxyXG4gIGJvaWxXYXRlcigpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICh0aGlzLmlzRGV2aWNlT24oKSAmJiB0aGlzLmN1cnJlbnRGdWxsbmVzcykge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XHJcbiAgICAgICAgdGhpcy50aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50VGVtcGVyYXR1cmUgPj1cclxuICAgICAgICAgICAgT2JqZWN0LnZhbHVlcyh0aGlzLm1vZGVzW3RoaXMuY3VycmVudE1vZGVdKVswXVxyXG4gICAgICAgICAgKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFRlbXBlcmF0dXJlICs9IDI7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEZ1bGxuZXNzLS07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuY3VycmVudFRlbXBlcmF0dXJlKTtcclxuICAgICAgICB0aGlzLm9mZigpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiaW1wb3J0IHsgU21hcnRIb3VzZSB9IGZyb20gJy4vU21hcnRIb3VzZSc7XHJcbmltcG9ydCB7IERldmljZSB9IGZyb20gJy4vRGV2aWNlJztcclxuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi9Mb2dnZXInO1xyXG5pbXBvcnQgeyBEZXZpY2VJbnRlcmZhY2UgfSBmcm9tICcuL0RldmljZUludGVyZmFjZSc7XHJcbmltcG9ydCB7IGlLZXR0bGUgfSBmcm9tICcuL2lLZXR0bGUnO1xyXG5pbXBvcnQgeyBTcGVha2VyIH0gZnJvbSAnLi9TcGVha2VyJztcclxuXHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICBpbnRlcmZhY2UgV2luZG93IHtcclxuICAgIHNoOiBvYmplY3Q7XHJcbiAgICBTcGVha2VyOiBGdW5jdGlvbjtcclxuICAgIGlLZXR0bGU6IEZ1bmN0aW9uO1xyXG4gIH1cclxufVxyXG5cclxud2luZG93LnNoID0gbmV3IFNtYXJ0SG91c2U8RGV2aWNlPignU21hcnQgSG91c2UnKTtcclxuXHJcbndpbmRvdy5TcGVha2VyID0gU3BlYWtlcjtcclxud2luZG93LmlLZXR0bGUgPSBpS2V0dGxlO1xyXG4iXSwic291cmNlUm9vdCI6IiJ9