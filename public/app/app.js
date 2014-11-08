define(["require", "exports", "../desktop.js/app/Editor", "../desktop.js/src/desktop/Desktop", "../desktop.js/src/desktop/FileBrowser", "../desktop.js/src/application/Terminal", "../desktop.js/src/menu/ContextMenu"], function(require, exports, Editor, Desktop, FileBrowser, Terminal, ContextMenu) {
    $(document).ready(function () {
        function getProjectFilesByPath(fileBrowser, path, cb) {
            $.ajax({
                type: 'POST',
                url: '/ls',
                data: { pwd: path },
                success: function (datas) {
                    var list = [];

                    function dblclick() {
                        fileBrowser.backs.push(this);
                        fileBrowser.aheads = [];
                        getProjectFilesByPath(fileBrowser, this.path);
                    }

                    datas.forEach(function (app) {
                        list.push({
                            app_id: app._id,
                            text: app.name,
                            type: app.type,
                            fileBrowser: fileBrowser,
                            dblclick: dblclick,
                            path: app.path,
                            pwd: app.pwd
                        });
                    });

                    fileBrowser.addShortcuts(list);
                    fileBrowser.setPath(path.replace(/\//g, '/'));
                    fileBrowser.setTitle(path.split('/').pop() || 'Computer');

                    fileBrowser.activeAheadIcon(fileBrowser.aheads.length);
                    fileBrowser.activeBackIcon(fileBrowser.backs.length);
                    cb && cb();
                },
                error: function () {
                }
            });
        }

        function fileRename(shortcut) {
            shortcut.setActive();
            shortcut.setRenameInput(function (beforeVal, afterVal) {
                $.ajax({
                    type: 'POST',
                    url: '/mv',
                    data: { pwd: shortcut.fileBrowser.path, beforeName: beforeVal, afterName: afterVal },
                    success: function (data) {
                        getProjectFilesByPath(shortcut.fileBrowser, shortcut.fileBrowser.path);
                    }
                });
            });
        }

        function fileBrowserMenu(event) {
            var self = this;

            var menu = new ContextMenu({
                renderTo: 'body',
                items: (function () {
                    var list = [];

                    list.push({
                        text: "New File",
                        handler: function (event) {
                            $.ajax({
                                type: 'POST',
                                url: '/touch',
                                data: { pwd: self.path, name: 'UntitledFile' },
                                success: function (data) {
                                    getProjectFilesByPath(self, self.path, function () {
                                        self.items.forEach(function (item) {
                                            if (item.text === 'UntitledFile')
                                                fileRename(item);
                                        });
                                    });
                                }
                            });
                        }
                    }, {
                        text: "Refresh",
                        handler: function (event) {
                            getProjectFilesByPath(self, self.path);
                        }
                    }, {
                        text: "New Folder",
                        handler: function (event) {
                            $.ajax({
                                type: 'POST',
                                url: '/mkdir',
                                data: { pwd: self.path, name: 'UntitledFolder' },
                                success: function (data) {
                                    getProjectFilesByPath(self, self.path, function () {
                                        self.items.forEach(function (item) {
                                            if (item.text === 'UntitledFolder')
                                                fileRename(item);
                                        });
                                    });
                                }
                            });
                        }
                    });

                    return list;
                }())
            });

            menu.show(event.clientX, event.clientY);
        }

        function showFileMenu() {
            var self = this;

            var menu = new ContextMenu({
                renderTo: 'body',
                items: [
                    {
                        text: 'Open',
                        handler: function () {
                            if (self.type === 'Directory') {
                                self.fileBrowser.backs.push(self);
                                self.fileBrowser.aheads = [];
                                getProjectFilesByPath(self.fileBrowser, self.path);
                            }
                        }
                    },
                    {
                        text: 'Delete',
                        handler: function () {
                            if (!confirm('are your sure?'))
                                return;

                            $.ajax({
                                type: 'POST',
                                url: '/rm',
                                data: { pwd: self.fileBrowser.path, name: self.text },
                                success: function (data) {
                                    getProjectFilesByPath(self.fileBrowser, self.fileBrowser.path);
                                }
                            });
                        }
                    },
                    {
                        text: "",
                        divider: true
                    },
                    {
                        text: 'Rename',
                        handler: function () {
                            fileRename(self);
                        }
                    },
                    {
                        text: 'Properties',
                        handler: function () {
                        }
                    }]
            });

            menu.show(event.clientX, event.clientY);
        }

        function showFileBrower(icon, path) {
            var fileBrowser = new FileBrowser({
                width: 1000,
                height: 500,
                bodyPadding: 5,
                icon: icon,
                taskBar: desktop.taskBar,
                taskBarHeight: 43,
                path: path,
                back: function () {
                    if (fileBrowser.backs.length) {
                        var shortcut = fileBrowser.backs.pop();
                        var path = shortcut.path.split('/');
                        path.pop();

                        fileBrowser.aheads.push(shortcut);
                        console.log(path.join('/') || '/');
                        getProjectFilesByPath(fileBrowser, path.join('/') || '/');
                    }
                },
                ahead: function () {
                    if (fileBrowser.aheads.length) {
                        var shortcut = fileBrowser.aheads.pop();
                        fileBrowser.backs.push(shortcut);
                        getProjectFilesByPath(fileBrowser, shortcut.path);
                    }
                    ;
                }
            });

            fileBrowser.render('body');
            fileBrowser.setFocus();

            desktop.taskBar.addTaskIcon(fileBrowser);
            getProjectFilesByPath(fileBrowser, path);
        }

        var desktop = new Desktop({
            backgroundImage: '/desktop.js/resource/themes/images/img0.jpg',
            shortcuts: [
                {
                    text: "Workspace",
                    icon: "workspace-icon",
                    dblclick: function () {
                        showFileBrower('file-browser', '/workspace');
                    }
                },
                {
                    text: "Computer",
                    icon: "computer-icon",
                    dblclick: function () {
                        showFileBrower('file-browser', '/');
                    }
                },
                {
                    text: "Terminal",
                    icon: "terminal-icon",
                    dblclick: function (cfg) {
                        var terminal = new Terminal({
                            width: "50%",
                            height: "60%",
                            dialog: true,
                            icon: 'terminal',
                            toolButton: true,
                            title: 'Terminal',
                            bodyPadding: 5,
                            taskBarHeight: 43
                        });

                        terminal.render('body');

                        terminal.setFocus();

                        desktop.taskBar.addTaskIcon(terminal);
                    }
                },
                {
                    text: "Editor",
                    icon: "editor-icon",
                    dblclick: function (cfg) {
                        var editor = new Editor({
                            taskBarHeight: 43,
                            code: 'editor',
                            width: '70%',
                            icon: 'editor',
                            bodyPadding: 5,
                            rootNode: [{
                                    name: "workspace", isParent: true, open: true, pwd: '/', path: '/workspace'
                                }]
                        });

                        editor.render('body');
                        editor.setFocus();
                        window['taskBar'] = desktop.taskBar;
                        window['taskBar'].addTaskIcon(editor);
                    }
                }]
        });

        desktop.render("body");
    });
});
