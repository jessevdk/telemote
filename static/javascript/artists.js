(function ($) {
	var methods = {
		init: function (options) {
			var $this = $(this),
			    data = $this.data('artists');

			if (!data)
			{
				var pl = $('<div/>');

				var settings = {
					listview: {
						columns: [
							{
								name: 'Artists',
								filter: function (item, index) { return item.name + ' (' + item.count + ')'; }
							}
						],
						multiselect: true,
						header_visible: true
					},
					loaded: function () {}
				};

				$.extend(settings.listview, options.listview);

				if (options.loaded)
				{
					settings.loaded = options.loaded;
				}

				$this.data('artists', {
					target: $this,
					artists: pl,
					settings: settings
				});

				pl.listview(settings.listview);

				pl.appendTo($this);
			}

			$this.addClass('artists');
			$this.artists('refresh');
		},

		refresh: function(sourceid) {
			var $this = $(this),
			    data = $this.data('artists');

			if (sourceid === undefined)
			{
				data.artists.listview('clear');
				return;
			}

			$.getJSON('/playlist/' + sourceid + '/artist', function (d) {
				var header = Utils.header_map(d['header']);
				var items = d['items'];

				var rows = $.map(items, function (item) {
					return {
						id: item[header.id],
						name: item[header.name],
						count: item[header.count]
					};
				});

				data.artists.listview('clear');
				data.artists.listview('append', rows);

				data.settings.loaded.call($this);
			});
		},

		listview: function () {
			var $this = $(this),
			    data = $this.data('artists');

			return $(data.artists);
		},

		destroy: function () {
			return this.each(function () {
				var $this = $(this),
				    data = $this.data('artists');

				$(window).unbind('artists');
				data.artists.remove();
				$this.removeData('artists');
			})
		}
	};

	$.fn.artists = function(method) {
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
			$.error('Method ' + method + ' does not exist on jQuery.artists');
		}
	};
})(jQuery);

/* vi:ex:ts=4 */
