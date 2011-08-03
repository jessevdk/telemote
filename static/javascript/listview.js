(function ($) {
	var methods = {
		init: function (options) {
			var $this = $(this),
			    data = $this.data('listview');

			var settings = {
				header_visible: false,
				columns: [],
				selectable: true,
				multiselect: true,
				selection_changed: function () {},
				activated: function () {}
			};

			$.extend(settings, options);

			if (data)
			{
				$this.listview('columns', settings.columns);
				return $this;
			}

			var table = $('<table><colgroup/><thead/><tbody/></table>');

			$this.data('listview', {
				target: $this,
				table: table,
				settings: settings
			});

			table.appendTo($this);

			$this.listview('columns', settings.columns);
			$this.addClass('listview');

			if (settings.selectable)
			{
				$this.addClass('selectable');
			}

			$this.bind('touchstart', function (e) {
				$this.listview('touchstart', e);
			});

			$this.bind('touchmove', function (e) {
				$this.listview('touchmove', e);
			});

			$this.bind('touchend', function (e) {
				$this.listview('touchend', e);
			});

			return $this;
		},

		touchstart: function (e) {
			var $this = $(this),
			    data = $this.data('listview');

			if (e.targetTouches.length != 1)
			{
				return false;
			}

			var x = e.targetTouches[0].clientX;
			var y = e.targetTouches[0].clientY;

			data.scroll = {
				scroll_top: $this.scrollTop(),
				x: x,
				y: y,
				last: {
					x: x,
					y: y,
					t: (new Date()).getTime(),
				},
				v: 0
			};

		},

		touchmove: function (e) {
			var $this = $(this),
			    data = $this.data('listview');

			if (e.targetTouches.length != 1)
			{
				return false;
			}

			var y = e.targetTouches[0].clientY;
			var yd = data.scroll.y - y;
			var t = (new Date()).getTime();

			data.scroll.v = (e.targetTouches[0].clientY - data.scroll.last.y) /
			                ((t - data.scroll.last.t) / 1000.0);

			data.scroll.last.x = e.targetTouches[0].clientX;
			data.scroll.last.y = e.targetTouches[0].clientY;
			data.scroll.last.t = t;

			$this.scrollTop(data.scroll.scroll_top + yd);
		},

		touchend: function (e) {
			var $this = $(this),
			    data = $this.data('listview');

			if (data.scroll.v > 0)
			{
				$this.listview('decelerate');
			}
		},

		decelerate: function () {
			var $this = $(this),
			    data = $this.data('listview');

			var a = -10;

			if (data.scroll.v > 0)
			{
				data.scroll.last.y += data.scroll.v * (13.0 / 1000);

				var yd = data.scroll.y - data.scroll.last.y;
				$this.scrollTop(data.scroll.scroll_top + yd);
			}

			data.scroll.v += a * (13.0 / 1000);

			if (data.scroll.v > 0)
			{
				setTimeout(function () {
					$this.listview('decelerate');
				}, 13);
			}
		},

		columns: function (columns) {
			var $this = $(this),
			    data = $this.data('listview');

			if (columns == undefined)
			{
				return data.columns;
			}

			var colgroup = data.table.find('colgroup');
			colgroup.empty();

			var thead = data.table.find('thead');
			thead.empty();

			header = $('<tr/>');

			if (!data.settings.header_visible)
			{
				header.hide();
			}

			header.appendTo(thead);

			data.columns = columns;
			data.column_map = {};

			$.each(columns, function (index, item) {
				var col = $('<col>');

				if (item.width)
				{
					col.attr('width', item.width);
				}

				col.appendTo(colgroup);

				var th = $('<th/>', {
					text: !item.name_hidden ? item.name : '',
					'class': item.name.toLowerCase()
				});

				th.appendTo(header);
				data.column_map[item.name] = index;

				if (!item.filter)
				{
					item.filter = function (item, index) { return escape(item); };
				}
			});
		},

		select_index: function (index, multi) {
			var $this = $(this),
			    data = $this.data('listview');

			var rows = data.table.find('tbody tr');
			$this.listview('select_row', $(rows[index]).listview('row'), multi);
		},

		select_row: function (row, multi) {
			var $this = $(this),
			    data = $this.data('listview');

			if (data.settings.multiselect && multi)
			{
				row.target.toggleClass('selected');
			}
			else
			{
				row.target.parent('tbody').children('tr').removeClass('selected');
				row.target.addClass('selected');
			}

			data.settings.selection_changed.call($this);
		},

		row: function (d) {
			var $this = $(this);

			if (d)
			{
				$this.data('listview:row', d);
				return d;
			}
			else
			{
				return $this.data('listview:row');
			}
		},

		append: function (rows) {
			var $this = $(this),
			    data = $this.data('listview');

			if (!$.isArray(rows))
			{
				rows = [rows];
			}

			var body = data.table.first('tbody');
			var ret = [];

			prevrow = body.last('tr');

			if (prevrow)
			{
				prevrow = prevrow.listview('row');
			}

			$.each(rows, function (index, row) {
				var tr = $('<tr/>');
				var html = [];

				if ($.isArray(row))
				{
					$.each(row, function (index, item) {
						html.push(data.columns[index].filter(item, index));
					});
				}
				else
				{
					$.each(data.columns, function (index, item) {
						html.push(item.filter(row, index));
					});
				}

				function group_new_value(prev, index, item)
				{
					if (!prev)
					{
						return true;
					}

					return (prev.groups[index].value != item);
				}

				var groups = {};

				if (prevrow)
				{
					groups = prevrow.groups;
				}

				$.each(html, function (index, item) {
					if (!data.columns[index].grouped ||
					    group_new_value(prevrow, index, item))
					{
						var td = $('<td/>', {
							html: item,
							'class': data.columns[index].name.toLowerCase()
						});

						td.appendTo(tr);

						if (data.columns[index].grouped)
						{
							groups[index] = {target: td, value: item};
						}
					}
					else if (data.columns[index].grouped)
					{
						/* Increase the rowspan */
						var td = prevrow.groups[index].target;
						var rowspan = td.attr('rowspan');

						if (!rowspan)
						{
							rowspan = 1;
						}
						else
						{
							rowspan = parseInt(rowspan);
						}

						td.attr('rowspan', rowspan + 1);

						if (!td.hasClass('grouped'))
						{
							td.addClass('grouped');
						}

						var tt = $(td).parent();

						if (!tt.hasClass('grouped'))
						{
							tt.addClass('grouped');
						}
					}
				});

				prevrow = {target: tr, data: row, groups: groups};

				tr.listview('row', prevrow);
				tr.appendTo(body);

				if (data.settings.selectable)
				{
					tr.bind('click', function (e) {
						if (!data.ignore_click)
						{
							$this.listview('select_row', $(tr).listview('row'), e.ctrlKey || e.button == 1);
						}
					});

					tr.bind('mousedown', function (e) {
						data.ignore_click = false;

						if (e.button != 0)
						{
							return;
						}

						data.activate_timeout = setTimeout(function () {
							data.settings.activated.call($this, tr.listview('row'));
							data.activate_timeout = 0;
							data.ignore_click = true;
						}, 1000);
					});

					tr.bind('mouseup', function (e) {
						if (data.activate_timeout)
						{
							clearTimeout(data.activate_timeout);
							data.activate_timeout = 0;
						}
					});
				}

				ret.push(row);
			});

			return $this;
		},

		rows: function () {
			var $this = $(this),
			    data = $this.data('listview');

			var ret = [];

			data.table.find('tbody tr').each(function (index, row) {
				var data = $(row).data('listview:row');
				ret.push(data.data);
			});

			return ret;
		},

		selected: function () {
			var $this = $(this),
			    data = $this.data('listview');

			var ret = [];

			data.table.find('tr.selected').each(function (index, row) {
				var data = $(row).data('listview:row');
				ret.push(data.data);
			});

			return ret;
		},

		clear: function () {
			var $this = $(this),
			    data = $this.data('listview');

			var rows = data.table.find('tbody tr');
			rows.remove();
		},

		destroy: function () {
			return this.each(function () {
				var $this = $(this),
				    data = $this.data('listview');

				data.table.find('tbody tr').removeData('listview:row');

				$(window).unbind('listview');
				$this.removeData('listview');
			})
		}
	};

	$.fn.listview = function(method) {
		if (methods[method])
		{
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
		}
		else if (typeof method === 'object' || !method)
		{
			return methods.init.apply(this, arguments);
		}
		else
		{
			$.error('Method ' + method + ' does not exist on jQuery.listview');
		}
	};
})(jQuery);

/* vi:ex:ts=4 */
