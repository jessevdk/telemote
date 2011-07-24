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

			return $this;
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
					text: item.name
				});

				th.appendTo(header);
				data.column_map[item.name] = index;

				if (!item.filter)
				{
					item.filter = function (item, index) { return item; };
				}
			});
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

			$.each(rows, function (index, row) {
				var tr = $('<tr/>');

				if ($.isArray(row))
				{
					$.each(row, function (index, item) {
						var td = $('<td/>', {
							text: data.columns[index].filter(item, index)
						});

						td.appendTo(tr);
					});
				}
				else
				{
					$.each(data.columns, function (index, item) {
						var td = $('<td/>', {
							text: item.filter(row, index)
						});

						td.appendTo(tr);
					});
				}

				tr.listview('row', {target: tr, data: row});
				tr.appendTo(body);

				if (data.settings.selectable)
				{
					tr.bind('click', function (e) {
						if (data.settings.multiselect && e.ctrlKey)
						{
							$(this).toggleClass('selected');
						}
						else
						{
							$(this).parent('tbody').children('tr').removeClass('selected');
							$(this).addClass('selected');
						}

						data.settings.selection_changed();
					});
				}

				ret.push(row);
			});

			return $this;
		},

		selected: function () {
			var $this = $(this),
			    data = $this.data('listview');

			var ret = [];

			data.table.find('tr.selected').each(function (index, row) {
				var data = row.data('listview:row');
				ret.push(data);
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
