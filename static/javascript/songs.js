(function ($) {
	var methods = {
		init: function (options) {
			var $this = $(this),
			    data = $this.data('songs');

			if (!data)
			{
				var pl = $('<div/>');

				var columns = [
					{
						name: 'Album',
						name_hidden: true,
						filter: function (e) { return '<div class="album">' + e.album + '</div> <div class="artist">' + e.artist + '</div>'; },
						grouped: true
					},
					{
						name: 'Title',
						width: '50%',
						filter: function (e) { return e.name; }
					},
					{
						name: 'Duration',
						width: '30px',
						filter: function (e) { return Utils.format_duration(e.duration); }
					}
				];

				if (!jQuery.support.touch)
				{
					columns.push({
						name: 'Queue',
						width: '30px',
						name_hidden: true,
						filter: function (e) {
							var img  = $('<img/>', {
								src: '/static/images/add.png',
								title: 'Add song to queue'
							});

							img.bind('click', function (e) {
								$this.songs.call($this, 'queue', $(img.parents('tr')[0]).listview('row'));
								return false;
							});

							return img;
						}
					});
				}

				var settings = {
					listview: {
						columns: columns,
						multiselect: true,
						header_visible: true
					},

					queued: function () {}
				};

				$.extend(settings.listview, options.listview);

				if (options.queued)
				{
					settings.queued = options.queued;
				}

				$this.data('songs', {
					target: $this,
					songs: pl,
					settings: settings
				});

				pl.listview(settings.listview);

				pl.appendTo($this);
			}

			$this.addClass('songs');
			$this.songs('refresh');
		},

		queue: function (row) {
			var $this = $(this),
			    data = $this.data('songs');

			data.settings.queued.call($this, row);
		},

		listview: function () {
			var $this = $(this),
			    data = $this.data('songs');

			return data.songs;
		},

		refresh: function(sourceid, artists) {
			var $this = $(this),
			    data = $this.data('songs');

			if (sourceid === undefined)
			{
				data.songs.listview('clear');
				return;
			}

			$.getJSON('/playlist/' + sourceid + '/artist/' + artists.join(','), function (d) {
				var header = Utils.header_map(d['header']);
				var items = d['items'];

				var rows = $.map(items, function (item) {
					return {
						id: item[header.id],
						name: item[header.name],
						album: item[header.album],
						artist: item[header.artist],
						duration: item[header.duration],
						count: item[header.count]
					};
				});

				data.songs.listview('clear');
				data.songs.listview('append', rows);
			});
		},

		destroy: function () {
			return this.each(function () {
				var $this = $(this),
				    data = $this.data('songs');

				$(window).unbind('songs');
				data.songs.remove();
				$this.removeData('songs');
			})
		}
	};

	$.fn.songs = function(method) {
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
			$.error('Method ' + method + ' does not exist on jQuery.songs');
		}
	};
})(jQuery);

/* vi:ex:ts=4 */
