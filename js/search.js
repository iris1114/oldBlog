// A local search script with the help of [hexo-generator-search](https://github.com/PaicHyperionDev/hexo-generator-search)
// Copyright (C) 2015
// Joseph Pan <http://github.com/wzpan>
// Shuhao Mao <http://github.com/maoshuhao>
// This library is free software; you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation; either version 2.1 of the
// License, or (at your option) any later version.
//
// This library is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA
// 02110-1301 USA
//

var searchFunc = function(path, search_id, content_id) {
  "use strict";
  var BTN =
    "<button type='button' class='local-search-close' id='local-search-close'></button>";
  $.ajax({
    url: path,
    dataType: "xml",
    success: function(xmlResponse) {
      // get the contents from search data
      // var datas = $("entry", xmlResponse).map(function () {
      //   return {
      //     title: $("title", this).text(),
      //     content: $("content", this).text(),
      //     url: $("url", this).text()
      //   };
      // }).get();

      // get the contents from search data
      // 基于 GitHub 用户 DrebinPeng 的修改
      var _div = document.createElement("div"); // 此处修改
      var datas = $("entry", xmlResponse)
        .map(function() {
          // 解决search.xml中的中文被转码为HTML实体的问题,即出现<p>&#x56E0;&#x6B64;&#x4E0A;</p>这样的问题
          _div.innerHTML = $("content", this).text(); // 此处修改
          return {
            title: $("title", this).text(),
            content: _div.innerHTML, // 此处修改
            url: $("url", this).text()
          };
        })
        .get();

      var $input = document.getElementById(search_id);
      var $resultContent = document.getElementById(content_id);

      $input.addEventListener("input", function() {
        var str = '<ul class="search-result-list">';
        var keywords = this.value
          .trim()
          .toLowerCase()
          .split(/[\s]+/);
        $resultContent.innerHTML = "";
        if (this.value.trim().length <= 0) {
          return;
        }
        // perform local searching
        datas.forEach(function(data) {
          var isMatch = true;
          // var content_index = [];
          if (!data.title || data.title.trim() === "") {
            data.title = "Untitled";
          }
          var data_title = data.title.trim().toLowerCase();
          var data_content = data.content
            .trim()
            .replace(/<[^>]+>/g, "")
            .toLowerCase();
          var data_url = data.url;
          var index_title = -1;
          var index_content = -1;
          var first_occur = -1;
          // only match artiles with not empty contents
          if (data_content !== "") {
            keywords.forEach(function(keyword, i) {
              index_title = data_title.indexOf(keyword);
              index_content = data_content.indexOf(keyword);

              if (index_title < 0 && index_content < 0) {
                isMatch = false;
              } else {
                if (index_content < 0) {
                  index_content = 0;
                }
                if (i == 0) {
                  first_occur = index_content;
                }
                // content_index.push({index_content:index_content, keyword_len:keyword_len});
              }
            });
          } else {
            isMatch = false;
          }
          // show search results
          if (isMatch) {
            str +=
              "<li><a href='" +
              data_url +
              "' class='search-result-title'>" +
              data_title +
              "</a>";
            var content = data.content.trim().replace(/<[^>]+>/g, "");
            if (first_occur >= 0) {
              // cut out 100 characters
              var start = first_occur - 20;
              var end = first_occur + 80;

              if (start < 0) {
                start = 0;
              }

              if (start == 0) {
                end = 100;
              }

              if (end > content.length) {
                end = content.length;
              }

              var match_content = content.substr(start, end);

              // highlight all keywords
              keywords.forEach(function(keyword) {
                var regS = new RegExp(keyword, "gi");
                match_content = match_content.replace(
                  regS,
                  '<em class="search-keyword">' + keyword + "</em>"
                );
              });

              str += '<p class="search-result">' + match_content + "...</p>";
            }
            str += "</li>";
          }
        });
        str += "</ul>";
        if (str.indexOf("<li>") === -1) {
          return ($resultContent.innerHTML =
            BTN +
            '<div class="search-result-empty"><p><i class="fe fe-tired"></i> No content found, please try again with some different keywords.<p></div>');
        }
        $resultContent.innerHTML = BTN + str;
      });
    }
  });
  $(document).on("click", "#local-search-close", function() {
    $("#local-search-input").val("");
    $("#local-search-result").html("");
  });
};
