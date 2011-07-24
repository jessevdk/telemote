(function ($) {
	var methods = {
		init: function (options) {
			var $this = $(this),
			    data = $this.data('playlists');

			if (!data)
			{
				var pl = $('<div/>');

				$this.data('playlists', {
					target: $this,
					playlists: pl
				});

				var settings = {
					listview: {
						columns: [
							{
								name: 'Playlists',
								filter: function (item, index) { return item.name + ' (' + item.count + ')'; }
							}
						],
						multiselect: false,
						header_visible: true
					}
				};

				$.extend(settings.listview, options.listview);

				pl.listview(settings.listview);

				pl.appendTo($this);
			}

			$this.addClass('playlists');
			$this.playlists('refresh');
		},

		refresh: function (options) {
			var data = this.data('playlists');

			$.getJSON('/playlist', function (d) {
				var header = Utils.header_map(d['header']);
				var items = d['items'];

				var rows = $.map(items, function (item) {
					return {
						id: item[header.id],
						name: item[header.name],
						count: item[header.count]
					};
				});

				data.playlists.listview('clear');
				data.playlists.listview('append', rows);
			});
		},

		destroy: function () {
			return this.each(function () {
				var $this = $(this),
				    data = $this.data('playlists');

				$(window).unbind('playlists');
				data.playlists.remove();
				$this.removeData('playlists');
			})
		}
	};

	$.fn.playlists = function(method) {
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
			$.error('Method ' + method + ' does not exist on jQuery.playlists');
		}
	};
})(jQuery);
