
# v1.0.4  2016-11-18

* Tab选项卡新增用于添加Tab选项的接口：element.tabAdd(filter, options);
* Tab选项卡新增用于外部删除Tab选项的接口：element.tabDelete(filter, index);
* Tab选项卡新增用于动态切换的接口：element.tabChange(filter, index);
* 表单组select、checkbox、radio等新增 disabled 属性的禁用支持

* 修复水平导航二级菜单在ie8下无法使用的bug
* 修复layPage分页在ie8的样式兼容问题
* 修复Form表单组radio框使用name="a[b]"、name="a.b"这种格式出现报错的bug
* 修复在使用了element.init()后，Tab选项卡的相关事件出现多次执行的bug
* 修复在使用了element.init()后，面包屑重复插入了分隔符的bug

* checkbox框样式调整，勾选图标放在左侧
* 导航菜单在ie10以下浏览器开启了hover效果


---


# v1.0.3  2016-11-10

* 集成 layer 3.0
* 重点增加导航菜单的二级菜单支持（水平导航和树形导航都支持）
* 表单select增加optgroup的分组支持
* 富文本编辑器新增获取选中内容的方法：layedit.getSelection(index)

* 修复layer模块无法使用layer.config的extend来加载拓展皮肤的bug
* 修复Tab选项卡与select的小冲突
* 修复Tab选项卡简洁模式与内容区域的导航的样式小冲突
* 修复Tab选项卡与内容区域的子Tab选项卡存在冲突的bug
* 修除表单组label标签、layDate与第三方框架（如Bootstrap）的样式冲突
* 修复flow流加载模块的的信息流，在设置isLazyimg:true时下拉报错的bug

* 表单select内容若超出最大宽度，则自适应宽度
* layui.js合并到layui.all.js中，也就是说，如果你不采用layui模块化规范，只需引入layui.all.js即可。


---


# v1.0.2 2016-10-18

* 修复layui.data('table', null); 无法删除本地表的bug
* 修改自定义事件监听机制

* 新增“引用”的区块多套显示风格
* 新增“字段集”多套显示风格
* 新增“纯圆角”公共CSS类
* 新增<hr>全局初始化CSS类

* 富文本编辑器增加用于同步编辑器内容到textarea的sync方法（一般用于异步提交）
* 修复富文本编辑器点击编辑区域无法关闭表情的bug
* 修复富文本编辑器未正确把内容同步到textarea的较严重bug
* 修复富文本编辑器中的一个css语法错误
* 修复表单input框ie8下某些小兼容问题

* 将复选框风格瘦身（因为群众普遍认为之前的“复选框”实在太胖了）
* 将表单下边距由20px调整为15px
* 完善表单响应式
* 处理layPage分页可能被第三方框架（如Bootstrap）引发的样式冲突
