const { QLabel, QMainWindow } = require ("@nodegui/nodegui") ;

const win = new QMainWindow();

const label = new QLabel(win);
label.setText("Hello world");
label.setInlineStyle("color: green; background-color: white;") ;

win.show();
global.win = win;
