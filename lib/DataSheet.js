'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _Sheet = require('./Sheet');

var _Sheet2 = _interopRequireDefault(_Sheet);

var _Row = require('./Row');

var _Row2 = _interopRequireDefault(_Row);

var _Cell = require('./Cell');

var _Cell2 = _interopRequireDefault(_Cell);

var _DataCell = require('./DataCell');

var _DataCell2 = _interopRequireDefault(_DataCell);

var _DataEditor = require('./DataEditor');

var _DataEditor2 = _interopRequireDefault(_DataEditor);

var _ValueViewer = require('./ValueViewer');

var _ValueViewer2 = _interopRequireDefault(_ValueViewer);

var _keys = require('./keys');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isEmpty = function isEmpty(obj) {
  return Object.keys(obj).length === 0;
};

var range = function range(start, end) {
  var array = [];
  var inc = end - start > 0;
  for (var i = start; inc ? i <= end : i >= end; inc ? i++ : i--) {
    inc ? array.push(i) : array.unshift(i);
  }
  return array;
};

var defaultParsePaste = function defaultParsePaste(str) {
  return str.split(/\r\n|\n|\r/).map(function (row) {
    return row.split('\t');
  });
};

var DataSheet = function (_PureComponent) {
  _inherits(DataSheet, _PureComponent);

  function DataSheet(props) {
    _classCallCheck(this, DataSheet);

    var _this = _possibleConstructorReturn(this, (DataSheet.__proto__ || Object.getPrototypeOf(DataSheet)).call(this, props));

    _this.onMouseDown = _this.onMouseDown.bind(_this);
    _this.onMouseUp = _this.onMouseUp.bind(_this);
    _this.onMouseOver = _this.onMouseOver.bind(_this);
    _this.onDoubleClick = _this.onDoubleClick.bind(_this);
    _this.onContextMenu = _this.onContextMenu.bind(_this);
    _this.handleNavigate = _this.handleNavigate.bind(_this);
    _this.handleKey = _this.handleKey.bind(_this).bind(_this);
    _this.handleComponentKey = _this.handleComponentKey.bind(_this);
    _this.handleCopy = _this.handleCopy.bind(_this);
    _this.handlePaste = _this.handlePaste.bind(_this);
    _this.pageClick = _this.pageClick.bind(_this);
    _this.onChange = _this.onChange.bind(_this);
    _this.onRevert = _this.onRevert.bind(_this);
    _this.isSelected = _this.isSelected.bind(_this);
    _this.isEditing = _this.isEditing.bind(_this);
    _this.isClearing = _this.isClearing.bind(_this);

    _this.defaultState = {
      start: {},
      end: {},
      selecting: false,
      forceEdit: false,
      editing: {},
      clear: {}
    };
    _this.state = _this.defaultState;

    _this.removeAllListeners = _this.removeAllListeners.bind(_this);
    return _this;
  }

  _createClass(DataSheet, [{
    key: 'removeAllListeners',
    value: function removeAllListeners() {
      document.removeEventListener('mousedown', this.pageClick);
      document.removeEventListener('mouseup', this.onMouseUp);
      document.removeEventListener('copy', this.handleCopy);
      document.removeEventListener('paste', this.handlePaste);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      // Add listener scoped to the DataSheet that catches otherwise unhandled
      // keyboard events when displaying components
      this.dgDom && this.dgDom.addEventListener('keydown', this.handleComponentKey);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.dgDom && this.dgDom.removeEventListener('keydown', this.handleComponentKey);
      this.removeAllListeners();
    }
  }, {
    key: 'pageClick',
    value: function pageClick(e) {
      var element = this.dgDom;
      if (!element.contains(e.target)) {
        this.setState(this.defaultState);
        this.removeAllListeners();
      }
    }
  }, {
    key: 'handleCopy',
    value: function handleCopy(e) {
      if (isEmpty(this.state.editing)) {
        e.preventDefault();
        var _props = this.props,
            dataRenderer = _props.dataRenderer,
            valueRenderer = _props.valueRenderer,
            data = _props.data;
        var _state = this.state,
            start = _state.start,
            end = _state.end;


        var text = range(start.i, end.i).map(function (i) {
          return range(start.j, end.j).map(function (j) {
            var cell = data[i][j];
            var value = dataRenderer ? dataRenderer(cell, i, j) : null;
            if (value === '' || value === null || typeof value === 'undefined') {
              return valueRenderer(cell, i, j);
            }
            return value;
          }).join('\t');
        }).join('\n');
        e.clipboardData.setData('text/plain', text);
      }
    }
  }, {
    key: 'handlePaste',
    value: function handlePaste(e) {
      var _this2 = this;

      if (isEmpty(this.state.editing)) {
        var start = this.state.start;

        var parse = this.props.parsePaste || defaultParsePaste;
        var pastedMap = [];
        var pasteData = parse(e.clipboardData.getData('text/plain'));

        var end = {};

        pasteData.map(function (row, i) {
          var rowData = [];
          row.map(function (pastedData, j) {
            var cell = _this2.props.data[start.i + i] && _this2.props.data[start.i + i][start.j + j];
            rowData.push({ cell: cell, data: pastedData });
            if (cell && !cell.readOnly && !_this2.props.onPaste) {
              _this2.props.onChange(cell, start.i + i, start.j + j, pastedData);
              end = { i: start.i + i, j: start.j + j };
            }
          });
          pastedMap.push(rowData);
        });
        this.props.onPaste && this.props.onPaste(pastedMap);
        this.setState({ end: end });
      }
    }
  }, {
    key: 'handleKeyboardCellMovement',
    value: function handleKeyboardCellMovement(e, _ref) {
      var data = _ref.data,
          start = _ref.start,
          isEditing = _ref.isEditing,
          currentCell = _ref.currentCell;

      if (isEditing) {
        return false;
      }
      var hasComponent = currentCell && currentCell.component;
      var forceComponent = currentCell && currentCell.forceComponent;

      if (hasComponent && (isEditing || forceComponent)) {
        return false;
      }

      var keyCode = e.which || e.keyCode;
      var newLocation = null;

      if (keyCode === _keys.TAB_KEY && !e.shiftKey) {
        newLocation = { i: start.i, j: start.j + 1 };
        newLocation = typeof data[newLocation.i][newLocation.j] !== 'undefined' ? newLocation : { i: start.i + 1, j: 0 };
      } else if (keyCode === _keys.RIGHT_KEY) {
        newLocation = { i: start.i, j: start.j + 1 };
      } else if (keyCode === _keys.LEFT_KEY || keyCode === _keys.TAB_KEY && e.shiftKey) {
        newLocation = { i: start.i, j: start.j - 1 };
      } else if (keyCode === _keys.UP_KEY) {
        newLocation = { i: start.i - 1, j: start.j };
      } else if (keyCode === _keys.DOWN_KEY) {
        newLocation = { i: start.i + 1, j: start.j };
      }

      if (newLocation && data[newLocation.i] && typeof data[newLocation.i][newLocation.j] !== 'undefined') {
        this.setState({ start: newLocation, end: newLocation, editing: {} });
      }
      if (newLocation) {
        e.preventDefault();
        return true;
      }
      return false;
    }
  }, {
    key: 'getSelectedCells',
    value: function getSelectedCells(data, start, end) {
      var selected = [];
      range(start.i, end.i).map(function (i) {
        range(start.j, end.j).map(function (j) {
          selected.push({ cell: data[i][j], i: i, j: j });
        });
      });
      return selected;
    }
  }, {
    key: 'handleKey',
    value: function handleKey(e) {
      var _this3 = this;

      if (e.isPropagationStopped && e.isPropagationStopped()) {
        return;
      }
      var keyCode = e.which || e.keyCode;
      var _state2 = this.state,
          start = _state2.start,
          end = _state2.end,
          editing = _state2.editing;

      var data = this.props.data;
      var isEditing = editing && !isEmpty(editing);
      var noCellsSelected = !start || isEmpty(start);
      var ctrlKeyPressed = e.ctrlKey || e.metaKey;
      var deleteKeysPressed = keyCode === _keys.DELETE_KEY || keyCode === _keys.BACKSPACE_KEY;
      var enterKeyPressed = keyCode === _keys.ENTER_KEY;
      var numbersPressed = keyCode >= 48 && keyCode <= 57;
      var lettersPressed = keyCode >= 65 && keyCode <= 90;
      var numPadKeysPressed = keyCode >= 96 && keyCode <= 105;
      var currentCell = !noCellsSelected && data[start.i][start.j];
      var equationKeysPressed = [187, /* equal */
      189, /* substract */
      190, /* period */
      107, /* add */
      109, /* decimal point */
      110].indexOf(keyCode) > -1;

      if (noCellsSelected || ctrlKeyPressed || this.handleKeyboardCellMovement(e, { data: data, start: start, isEditing: isEditing, currentCell: currentCell })) {
        return true;
      }

      if (!isEditing) {
        if (deleteKeysPressed) {
          // ugly solution brought to you by https://reactjs.org/docs/react-component.html#setstate
          // setState in a loop is unreliable
          setTimeout(function () {
            _this3.getSelectedCells(data, start, end).map(function (_ref2) {
              var cell = _ref2.cell,
                  i = _ref2.i,
                  j = _ref2.j;
              return !cell.readOnly ? _this3.onChange(i, j, '') : null;
            });
          }, 0);
          e.preventDefault();
        } else if (currentCell && !currentCell.readOnly) {
          if (enterKeyPressed) {
            this.setState({ editing: start, clear: {}, forceEdit: true });
            e.preventDefault();
          } else if (numbersPressed || numPadKeysPressed || lettersPressed || equationKeysPressed) {
            // empty out cell if user starts typing without pressing enter
            this.setState({ editing: start, clear: start, forceEdit: false });
          }
        }
      }
    }
  }, {
    key: 'handleComponentKey',
    value: function handleComponentKey(e) {
      var _this4 = this;

      // handles keyboard events when editing components
      var keyCode = e.which || e.keyCode;
      if ([_keys.ENTER_KEY, _keys.ESCAPE_KEY, _keys.TAB_KEY].includes(keyCode)) {
        var editing = this.state.editing;

        if (!isEmpty(editing)) {
          var data = this.props.data;

          var currentCell = data[editing.i][editing.j];
          var offset = e.shiftKey ? -1 : 1;
          if (currentCell && currentCell.component) {
            var func = this.onRevert; // ESCAPE_KEY
            if (keyCode === _keys.ENTER_KEY) {
              func = function func() {
                return _this4.handleNavigate({ i: offset, j: 0 });
              };
            } else if (keyCode === _keys.TAB_KEY) {
              func = function func() {
                return _this4.handleNavigate({ i: 0, j: offset });
              };
            }
            // setTimeout makes sure that component is done handling the event before we take over
            setTimeout(func, 1);
          }
        }
      }
    }
  }, {
    key: 'handleNavigate',
    value: function handleNavigate(offsets) {
      if (offsets && (offsets.i || offsets.j)) {
        var start = this.state.start;
        var data = this.props.data;

        var newLocation = { i: start.i + offsets.i, j: start.j + offsets.j };
        if (data[newLocation.i] && typeof data[newLocation.i][newLocation.j] !== 'undefined') {
          this.setState({ start: newLocation, end: newLocation, editing: {} });
        }
      }
      this.dgDom && this.dgDom.focus();
    }
  }, {
    key: 'onContextMenu',
    value: function onContextMenu(evt, i, j) {
      var cell = this.props.data[i][j];
      if (this.props.onContextMenu) {
        this.props.onContextMenu(evt, cell, i, j);
      }
    }
  }, {
    key: 'onDoubleClick',
    value: function onDoubleClick(i, j) {
      var cell = this.props.data[i][j];
      if (!cell.readOnly) {
        this.setState({ editing: { i: i, j: j }, forceEdit: true, clear: {} });
      }
    }
  }, {
    key: 'onMouseDown',
    value: function onMouseDown(i, j) {
      var editing = isEmpty(this.state.editing) || this.state.editing.i !== i || this.state.editing.j !== j ? {} : this.state.editing;
      this.setState({ selecting: true, start: { i: i, j: j }, end: { i: i, j: j }, editing: editing, forceEdit: false });

      // Keep listening to mouse if user releases the mouse (dragging outside)
      document.addEventListener('mouseup', this.onMouseUp);
      // Listen for any outside mouse clicks
      document.addEventListener('mousedown', this.pageClick);

      // Copy paste event handler
      document.addEventListener('copy', this.handleCopy);
      document.addEventListener('paste', this.handlePaste);
    }
  }, {
    key: 'onMouseOver',
    value: function onMouseOver(i, j) {
      if (this.state.selecting && isEmpty(this.state.editing)) {
        this.setState({ end: { i: i, j: j } });
      }
    }
  }, {
    key: 'onMouseUp',
    value: function onMouseUp() {
      this.setState({ selecting: false });
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  }, {
    key: 'onChange',
    value: function onChange(i, j, val) {
      this.props.onChange(this.props.data[i][j], i, j, val);
      this.onRevert();
    }
  }, {
    key: 'onRevert',
    value: function onRevert() {
      this.setState({ editing: {} });
      this.dgDom && this.dgDom.focus();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      var prevEnd = prevState.end;
      if (!isEmpty(this.state.end) && !(this.state.end.i === prevEnd.i && this.state.end.j === prevEnd.j)) {
        this.props.onSelect && this.props.onSelect(this.props.data[this.state.end.i][this.state.end.j]);
      }
    }
  }, {
    key: 'isSelected',
    value: function isSelected(i, j) {
      var start = this.state.start;
      var end = this.state.end;
      var posX = j >= start.j && j <= end.j;
      var negX = j <= start.j && j >= end.j;
      var posY = i >= start.i && i <= end.i;
      var negY = i <= start.i && i >= end.i;

      return posX && posY || negX && posY || negX && negY || posX && negY;
    }
  }, {
    key: 'isEditing',
    value: function isEditing(i, j) {
      return this.state.editing.i === i && this.state.editing.j === j;
    }
  }, {
    key: 'isClearing',
    value: function isClearing(i, j) {
      return this.state.clear.i === i && this.state.clear.j === j;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      var _props2 = this.props,
          SheetRenderer = _props2.sheetRenderer,
          RowRenderer = _props2.rowRenderer,
          cellRenderer = _props2.cellRenderer,
          dataRenderer = _props2.dataRenderer,
          valueRenderer = _props2.valueRenderer,
          dataEditor = _props2.dataEditor,
          valueViewer = _props2.valueViewer,
          attributesRenderer = _props2.attributesRenderer,
          className = _props2.className,
          overflow = _props2.overflow,
          data = _props2.data,
          keyFn = _props2.keyFn;
      var forceEdit = this.state.forceEdit;


      return _react2.default.createElement(
        'span',
        { ref: function ref(r) {
            _this5.dgDom = r;
          }, tabIndex: '0', className: 'data-grid-container', onKeyDown: this.handleKey },
        _react2.default.createElement(
          SheetRenderer,
          { data: data, className: ['data-grid', className, overflow].filter(function (a) {
              return a;
            }).join(' ') },
          data.map(function (row, i) {
            return _react2.default.createElement(
              RowRenderer,
              { key: keyFn ? keyFn(i) : i, row: i, cells: row },
              row.map(function (cell, j) {
                return _react2.default.createElement(_DataCell2.default, {
                  key: cell.key ? cell.key : i + '-' + j,
                  row: i,
                  col: j,
                  cell: cell,
                  forceEdit: forceEdit,
                  onMouseDown: _this5.onMouseDown,
                  onMouseOver: _this5.onMouseOver,
                  onDoubleClick: _this5.onDoubleClick,
                  onContextMenu: _this5.onContextMenu,
                  onChange: _this5.onChange,
                  onRevert: _this5.onRevert,
                  onNavigate: _this5.handleNavigate,
                  onKey: _this5.handleKey,
                  selected: _this5.isSelected(i, j),
                  editing: _this5.isEditing(i, j),
                  clearing: _this5.isClearing(i, j),
                  attributesRenderer: attributesRenderer,
                  cellRenderer: cellRenderer,
                  valueRenderer: valueRenderer,
                  dataRenderer: dataRenderer,
                  valueViewer: valueViewer,
                  dataEditor: dataEditor
                });
              })
            );
          })
        )
      );
    }
  }]);

  return DataSheet;
}(_react.PureComponent);

exports.default = DataSheet;


DataSheet.propTypes = {
  data: _propTypes2.default.array.isRequired,
  className: _propTypes2.default.string,
  overflow: _propTypes2.default.oneOf(['wrap', 'nowrap', 'clip']),
  onChange: _propTypes2.default.func,
  onContextMenu: _propTypes2.default.func,
  valueRenderer: _propTypes2.default.func.isRequired,
  dataRenderer: _propTypes2.default.func,
  sheetRenderer: _propTypes2.default.func.isRequired,
  rowRenderer: _propTypes2.default.func.isRequired,
  cellRenderer: _propTypes2.default.func.isRequired,
  valueViewer: _propTypes2.default.func,
  dataEditor: _propTypes2.default.func,
  parsePaste: _propTypes2.default.func,
  attributesRenderer: _propTypes2.default.func
};

DataSheet.defaultProps = {
  sheetRenderer: _Sheet2.default,
  rowRenderer: _Row2.default,
  cellRenderer: _Cell2.default,
  valueViewer: _ValueViewer2.default,
  dataEditor: _DataEditor2.default
};