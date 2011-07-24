(function ($) {
	var methods = {
		init: function (options) {
			var $this = $(this),
			    data = $this.data('artists');

			if (!data)
			{
				var pl = $('<div/>');

				$this.data('artists', {
					target: $this,
					artists: pl
				});

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
					}
				};

				$.extend(settings, options);

				pl.listview(settings.listview);

				pl.appendTo($this);
			}

			$this.addClass('artists');
			$this.artists('refresh');
		},

		refresh: function(sourceid) {
			var data = this.data('artists');

			if (!sourceid)
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
			});
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
