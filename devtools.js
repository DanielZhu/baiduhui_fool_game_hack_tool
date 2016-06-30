// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function Console() {
}

Console.Type = {
  LOG: "log",
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
  GROUP: "group",
  GROUP_COLLAPSED: "groupCollapsed",
  GROUP_END: "groupEnd"
};

Console.addMessage = function(type, format, args) {
  chrome.extension.sendRequest({
      command: "sendToConsole",
      tabId: chrome.devtools.tabId,
      args: escape(JSON.stringify(Array.prototype.slice.call(arguments, 0)))
  });
};

// Generate Console output methods, i.e. Console.log(), Console.debug() etc.
(function() {
  var console_types = Object.getOwnPropertyNames(Console.Type);
  for (var type = 0; type < console_types.length; ++type) {
    var method_name = Console.Type[console_types[type]];
    Console[method_name] = Console.addMessage.bind(Console, method_name);
  }
})();

function ChromeFirePHP() {
};

ChromeFirePHP.handleFirePhpHeaders = function(har_entry) {
  var response_headers = har_entry.response.headers;
  var wf_header_map = {};
  var had_wf_headers = false;

  for (var i = 0; i < response_headers.length; ++i) {
    var header = response_headers[i];
    if (/^X-Wf-/.test(header.name)) {
      wf_header_map[header.name] = header.value;
      had_wf_headers = true;
    }
  }

  var proto_header = wf_header_map["X-Wf-Protocol-1"];
  if (!had_wf_headers || !this._checkProtoVersion(proto_header))
    return;

  var message_objects = this._buildMessageObjects(wf_header_map);
  message_objects.sort(function(a, b) {
      var aFile = a.File || "";
      var bFile = b.File || "";
      if (aFile !== bFile)
        return aFile.localeCompare(bFile);
      var aLine = a.Line !== undefined ? a.Line : -1;
      var bLine = b.Line !== undefined ? b.Line : -1;
      return aLine - bLine;
  });

  var context = { pageRef: har_entry.pageref };
  for (var i = 0; i < message_objects.length; ++i)
    this._processLogMessage(message_objects[i], context);
  if (context.groupStarted)
    Console.groupEnd();
};

ChromeFirePHP._processLogMessage = function(message, context) {
  var meta = message[0];
  if (!meta) {
    Console.error("No Meta in FirePHP message");
    return;
  }

  var body = message[1];
  var type = meta.Type;
  if (!type) {
    Console.error("No Type for FirePHP message");
    return;
  }

  switch (type) {
    case "LOG":
    case "INFO":
    case "WARN":
    case "ERROR":
      if (!context.groupStarted) {
        context.groupStarted = true;
        Console.groupCollapsed(context.pageRef || "");
      }
      Console.addMessage(Console.Type[type], "%s%o",
          (meta.Label ? meta.Label + ": " : ""), body);
      break;
    case "EXCEPTION":
    case "TABLE":
    case "TRACE":
    case "GROUP_START":
    case "GROUP_END":
     // FIXME: implement
     break;
  }
};

ChromeFirePHP._buildMessageObjects = function(header_map)
{
  const normal_header_prefix = "X-Wf-1-1-1-";

  return this._collectMessageObjectsForPrefix(header_map, normal_header_prefix);
};

ChromeFirePHP._collectMessageObjectsForPrefix = function(header_map, prefix) {
  var results = [];
  const header_regexp = /(?:\d+)?\|(.+)/;
  var json = "";
  for (var i = 1; ; ++i) {
    var name = prefix + i;
    var value = header_map[name];
    if (!value)
      break;

    var match = value.match(header_regexp);
    if (!match) {
      Console.error("Failed to parse FirePHP log message: " + value);
      break;
    }
    var json_part = match[1];
    json += json_part.substring(0, json_part.lastIndexOf("|"));
    if (json_part.charAt(json_part.length - 1) === "\\")
      continue;
    try {
      var message = JSON.parse(json);
      results.push(message);
    } catch(e) {
      Console.error("Failed to parse FirePHP log message: " + json);
    }
    json = "";
  }
  return results;
};

ChromeFirePHP._checkProtoVersion = function(proto_header) {
  if (!proto_header) {
    Console.warn("WildFire protocol header not found");
    return;
  }

  var match = /http:\/\/meta\.wildfirehq\.org\/Protocol\/([^\/]+)\/(.+)/.exec(
      proto_header);
  if (!match) {
    Console.warn("Invalid WildFire protocol header");
    return;
  }
  var proto_name = match[1];
  var proto_version = match[2];
  if (proto_name !== "JsonStream" || proto_version !== "0.2") {
    Console.warn(
        "Unknown FirePHP protocol version: %s (expecting JsonStream/0.2)",
        proto_name + "/" + proto_version);
    return false;
  }
  return true;
};

// chrome.devtools.network.addRequestHeaders({
//     "X-FirePHP-Version": "0.0.6"
// });

// chrome.devtools.network.getHAR(function(result) {
//   var entries = result.entries;
//   if (!entries.length) {
//     Console.warn("ChromeFirePHP suggests that you reload the page to track" +
//         " FirePHP messages for all the requests");
//   }
//   for (var i = 0; i < entries.length; ++i)
//     ChromeFirePHP.handleFirePhp_headers(entries[i]);

//   chrome.devtools.network.onRequestFinished.addListener(
//       Console.warn('aaa');
//       ChromeFirePHP.handleFirePhpHeaders.bind(ChromeFirePHP));
// });


chrome.devtools.network.onRequestFinished.addListener(function (req) {
    // Console.log(req.request.url);
    if (req.request.url.indexOf('/fool/game/info') > 0) {
        // Console.log('true:' + req.request.url);
        req.getContent(function (content, encoding) {
            // Console.log(encoding);
            var perfectGoodsList = [
                {
                    "name": "2014年苹果设计奖《纪念碑谷》",
                    "huiPrice": 0,
                    "savedPrice": 25,
                    "img": "http://huiimg.baidu.com/hui/7181f726f3480a3a96cbf56b0ed9ff69"
                },
                {
                    "name": "施华蔻 保丽强健丝滑发质修护霜",
                    "huiPrice": 19.9,
                    "savedPrice": 108.1,
                    "img": "http://huiimg.baidu.com/hui/5609c8946ad9df48a7619681214027d2"
                },
                {
                    "name": "科颜氏1号护唇膏15ml",
                    "huiPrice": 23.7,
                    "savedPrice": 54.3,
                    "img": "http://huiimg.baidu.com/hui/198ab6f887bc5fa00a6cfd66b7317c8b"
                },
                {
                    "name": "日本ROYCE' 生巧白巧克力20枚",
                    "huiPrice": 41,
                    "savedPrice": 94,
                    "img": "http://huiimg.baidu.com/hui/aab7501826aa7597078003b9941392ed"
                },
                {
                    "name": "双立人 ZW-N73 不锈钢肥皂 60g",
                    "huiPrice": 69,
                    "savedPrice": 290,
                    "img": "http://huiimg.baidu.com/hui/aae3b1ef50c7fada35f7fc8163c003b6"
                },
                {
                    "name": "Perrier 巴黎水 天然含气矿泉水 330ml*24瓶",
                    "huiPrice": 99,
                    "savedPrice": 150,
                    "img": "http://huiimg.baidu.com/hui/bdd46fabe836cc7d2417fffe59540ae1"
                },
                {
                    "name": "GODIVA 85%黑巧克力排块 100g*3",
                    "huiPrice": 105,
                    "savedPrice": 210,
                    "img": "http://huiimg.baidu.com/hui/f3eeeedd420a42b72be98eb4d1ea5452"
                },
                {
                    "name": "苏泊尔 GT10Z01A-13 挂烫机",
                    "huiPrice": 159,
                    "savedPrice": 340,
                    "img": "http://huiimg.baidu.com/hui/d8932c9791e36dfa680c9cf5ce126145"
                },
                {
                    "name": "SK-Ⅱ前男友面膜10片",
                    "huiPrice": 542,
                    "savedPrice": 726,
                    "img": "http://huiimg.baidu.com/hui/089807a2e7733de41492b4259dc2b586"
                },
                {
                    "name": "高丝 日本原装VC面膜 30片/盒",
                    "huiPrice": 49,
                    "savedPrice": 50,
                    "img": "http://huiimg.baidu.com/hui/44713a0a76a1dd3d29651a732582c17b"
                },
                {
                    "name": "Baileys 百利甜酒 750ml",
                    "huiPrice": 35,
                    "savedPrice": 54,
                    "img": "http://huiimg.baidu.com/hui/1f93bc2929ea5194c7045349d603f1a9"
                },
                {
                    "name": "麦开 C107 Cuptime 智能水杯",
                    "huiPrice": 199,
                    "savedPrice": 200,
                    "img": "http://huiimg.baidu.com/hui/558dc7dc26c2cbd1fa3a11528a29c531"
                },
                {
                    "name": "长帝 CRDF25 立方体内胆电烤箱 30L",
                    "huiPrice": 199,
                    "savedPrice": 199,
                    "img": "http://huiimg.baidu.com/hui/a7ddbc91dab20fcd99ee7432270799c4"
                },
                {
                    "name": "施华洛世奇 白色典雅天使水晶耳钉",
                    "huiPrice": 289,
                    "savedPrice": 300,
                    "img": "http://huiimg.baidu.com/hui/6d9da429d4b17742c3b26b81bdc7c309"
                },
                {
                    "name": "丽得姿 美蒂优氨基酸深层补水面膜 10片",
                    "huiPrice": 39.9,
                    "savedPrice": 39.1,
                    "img": "http://huiimg.baidu.com/hui/73f2e622d1bff328762b1ac65ec1db8f"
                }
            ];

            var matchCount = 0;
            var huiPriceTotal = 0;
            var savedPriceTotal = 0;
            var pickedList = [];

            // Console.log(content);
            content = JSON.parse(content);
            var hasKeyGood = false;
            var goodsList = content.data.result;
            // Console.log('list length: ' + goodsList.length);

            // loop perfect goods list
            for (var j = 0; j < perfectGoodsList.length; j++) {
                var perGoods = perfectGoodsList[j];

                // loop the current round data
                for (var i = 0; i < goodsList.length; i++) {
                    var goods = goodsList[i];
                    // Console.log(perGoods.img + ' ' + goods.img + (goods.img.indexOf(perGoods.img) !== -1));
                    if (goods.img.indexOf(perGoods.img) !== -1) {
                        matchCount++;
                        savedPriceTotal += perGoods.savedPrice;
                        huiPriceTotal += perGoods.huiPrice;
                        pickedList.push({goods: perGoods, idx: i + 1});
                        if (i === 8) {
                            hasKeyGood = true;
                            Console.warn('Has boyfriend');
                        }
                    }
                }
            }

            Console.log('matchCount: ' + matchCount, 'savedPriceTotal: ' + savedPriceTotal);
            if (savedPriceTotal >= 1700 && hasKeyGood) {
                Console.error('savedPriceTotal:' + savedPriceTotal, 'huiPriceTotal: ' + huiPriceTotal);
                alert('Buy');
                Console.log('picked list: ' + pickedList.length);
                pickedList.sort(function (item0, item1) {
                    return item0.idx > item1.idx;
                });

                pickedList.forEach(function (item) {
                    Console.warn(item.idx + '  ' + item.goods.huiPrice + '  ' + item.goods.savedPrice + '  ' + item.goods.title);
                });

                if (huiPriceTotal > 1000) {

                    // decrease the match rate of the product
                    for (var m = 0; m < pickedList.length; m++) {
                        savedPriceTotal = 0;
                        huiPriceTotal = 0;
                        for (var k = 0; k < pickedList.length; k++) {
                            if (m === k) {
                                continue;
                            }

                            var pickedItem = pickedList[k];
                            savedPriceTotal += pickedItem.goods.savedPrice;
                            huiPriceTotal += pickedItem.goods.huiPrice;
                        }

                        Console.error('remove: ' + m + ' Round 1 - savedPriceTotal:' + savedPriceTotal, 'huiPriceTotal: ' + huiPriceTotal);
                        if (savedPriceTotal >= 1700 && huiPriceTotal <= 1000) {
                            pickedList.forEach(function (item) {
                                Console.warn(item.idx + '  ' + item.goods.title);
                            });
                            Console.log('remove: ' + m);
                            break;
                        }
                    }
                }
            }
            else {
                Console.log(savedPriceTotal > 1700 ? '' : '< 1700');
                Console.log(hasKeyGood ? '' : 'no exboyfriend');
                chrome.runtime.sendMessage({
                    type: "refreshPage"
                }, function(res) {

                });

                // var code = 'window.location.reload();';
                // chrome.tabs.executeScript(tab.id, {code: code});
            }
        });
    }

  // Console.warn(JSON.stringify(detail));
});
