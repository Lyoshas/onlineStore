"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var pg_query_stream_1 = require("pg-query-stream");
var pg_1 = require("pg");
var opensearch_1 = require("@opensearch-project/opensearch");
if (process.env.OPENSEARCH_USERNAME == null ||
    process.env.OPENSEARCH_PASSWORD == null) {
    throw new Error('process.env.OPENSEARCH_USERNAME or process.env.OPENSEARCH_PASSWORD are not defined');
}
var snakeCaseToCamelCase = function (inputStr) {
    return inputStr.replace(/_[a-z]/gi, function (match) {
        return match[1].toUpperCase();
    });
};
var osearchClient = new opensearch_1.Client({
    node: process.env.OPENSEARCH_NODE,
    auth: {
        username: process.env.OPENSEARCH_USERNAME,
        password: process.env.OPENSEARCH_PASSWORD
    },
    ssl: { rejectUnauthorized: false }
});
var pgPool = new pg_1["default"].Pool({
    ssl: { rejectUnauthorized: false }
});
var formatSqlQuery = function (sqlQuery) {
    return (sqlQuery
        .trim()
        // replace tabs and new lines with a space character
        .replace(/(\t)|(\n)/g, ' ')
        // replace two or more consecutive spaces
        .replace(/\s{2,}/g, ' '));
};
var camelCaseObject = function (input) {
    // if "input" is anything but an object or an array, return "input" immediately
    if ((typeof input !== 'object' && !Array.isArray(input)) ||
        input === null) {
        return input;
    }
    // if we make it here, "input" is either an array or an object
    if (Array.isArray(input)) {
        return input.map(function (nestedValue) { return camelCaseObject(nestedValue); });
    }
    else {
        // "input" is an object
        var result = {};
        for (var _i = 0, _a = Object.entries(input); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            result[snakeCaseToCamelCase(key)] = camelCaseObject(value);
        }
        return result;
    }
};
var ProductLoader = /** @class */ (function () {
    function ProductLoader(pgPool, pgClient, osearchClient) {
        this.pgPool = pgPool;
        this.pgClient = pgClient;
        this.osearchClient = osearchClient;
    }
    ProductLoader.prototype.loadPgProductsToOpenSearch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var productStream = _this.getPgProductStream();
                        var bulkRequestBody = [];
                        productStream.on('data', function (row) {
                            var productData = camelCaseObject(row);
                            bulkRequestBody.push({
                                create: {
                                    _index: ProductLoader.PRODUCTS_INDEX
                                }
                            });
                            bulkRequestBody.push(productData);
                        });
                        productStream.on('close', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, osearchClient.bulk({
                                            index: ProductLoader.PRODUCTS_INDEX,
                                            body: bulkRequestBody
                                        })];
                                    case 1:
                                        _a.sent();
                                        resolve();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    })];
            });
        });
    };
    ProductLoader.prototype.productsIndexExists = function () {
        return __awaiter(this, void 0, void 0, function () {
            var body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.osearchClient.indices.exists({
                            index: ProductLoader.PRODUCTS_INDEX
                        })];
                    case 1:
                        body = (_a.sent()).body;
                        return [2 /*return*/, body];
                }
            });
        });
    };
    ProductLoader.prototype.removeProductsIndex = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, osearchClient.indices["delete"]({
                            index: ProductLoader.PRODUCTS_INDEX
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ProductLoader.prototype.getPgProductStream = function () {
        var query = new pg_query_stream_1["default"](formatSqlQuery("\n                SELECT\n                    p.id AS product_id,\n                    p.title,\n                    c.category AS category,\n                    p.short_description\n                FROM products AS p\n                INNER JOIN product_categories AS c ON c.id = p.category_id\n                ORDER BY p.id\n            "));
        return this.pgClient.query(query);
    };
    ProductLoader.prototype.resourceCleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.pgClient.release();
                        return [4 /*yield*/, this.osearchClient.close()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.pgPool.end()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ProductLoader.PRODUCTS_INDEX = process.env.OPENSEARCH_PRODUCTS_INDEX_NAME;
    return ProductLoader;
}());
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var productLoader, _a, _b, e_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = ProductLoader.bind;
                    _b = [void 0, pgPool];
                    return [4 /*yield*/, pgPool.connect()];
                case 1:
                    productLoader = new (_a.apply(ProductLoader, _b.concat([_c.sent(), osearchClient])))();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 8, 9, 11]);
                    // removing all the stored products from OpenSearch
                    console.log('Checking if the product index exists...');
                    return [4 /*yield*/, productLoader.productsIndexExists()];
                case 3:
                    if (!_c.sent()) return [3 /*break*/, 5];
                    console.log('The product index exists, removing it...');
                    return [4 /*yield*/, productLoader.removeProductsIndex()];
                case 4:
                    _c.sent();
                    console.log('The index has been successfully removed');
                    return [3 /*break*/, 6];
                case 5:
                    console.log('The product index does not exist');
                    _c.label = 6;
                case 6:
                    console.log('Copying products stored in PostgreSQL into OpenSearch...');
                    return [4 /*yield*/, productLoader.loadPgProductsToOpenSearch()];
                case 7:
                    _c.sent();
                    return [3 /*break*/, 11];
                case 8:
                    e_1 = _c.sent();
                    throw e_1;
                case 9: return [4 /*yield*/, productLoader.resourceCleanup()];
                case 10:
                    _c.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
main();
