(function ($) {
	var methods = {
		init: function (options) {
			var $this = $(this),
			    data = $this.data('player');

			if (!data)
			{
				var settings = {
					setplaylist: function () {}
				};

				$.extend(settings, options);

				data = {
					target: $this,
					settings: settings
				};

				$this.data('player', data);

				var div = $('<div>', {id: 'buttons'});
				var buttons = [
					{
						name: 'play',
						icon: 'media-playback-start',
						title: 'Play'
					},
					{
						name: 'previous',
						icon: 'media-skip-backward',
						title: 'Previous'
					},
					{
						name: 'next',
						icon: 'media-skip-forward',
						title: 'Next'
					},
					{
						name: 'repeat',
						icon: 'media-playlist-repeat',
						title: 'Repeat'
					},
					{
						name: 'shuffle',
						icon: 'media-playlist-shuffle',
						title: 'Shuffle'
					}
				];

				$.each(buttons, function (index, elem) {
					var img = $('<img/>', {
						id: 'button_' + elem.name,
						src: "/static/images/" + elem.icon + '.png',
						'class': 'button',
						title: elem.title
					});

					var name = elem.name;

					img.button();

					img.bind('click', function (e) {
						$this.player(name);
					});

					img.appendTo(div);
				});

				var vol = $('<div/>', {
					id: 'volume'
				});

				var img = $('<img/>', {
					id: 'button_mute',
					src: "/static/images/stock_volume-mute.png",
					'class': 'button',
					title: 'Mute'
				});

				img.bind('click', function () {
					$this.player('mute');
				});

				img.appendTo(vol);

				var volpgsc = $('<div/>', {
					id: 'volume_progress_container',
					'class': 'progress_container'
				});

				volpgsc.bind('click', function (e) {
					var p = e.offsetX / volpgsc.width();
					$this.player('volume', p);
				});

				var volpgs = $('<div/>', {
					id: 'volume_progress',
					'class': 'progress'
				})

				volpgs.appendTo(volpgsc);

				vol.appendTo(div);
				volpgsc.appendTo(div);

				div.appendTo($this);

				div = $('<div/>', {id: 'playing'});
				div.appendTo($this);

				div = $('<div/>', {id: 'playing_duration', 'class': 'progress_container'});
				div.appendTo($this);

				div = $('<div/>', {id: 'actions'});

				var inp = $('<input/>', {
					type: 'button',
					value: 'Set Playlist',
					id: 'setplaylist'
				});

				inp.bind('click', function () {
					data.settings.setplaylist.call($this);
				});

				inp.appendTo(div);
				div.appendTo($this);

				var queue = $('<div/>', {
					id: 'queue'
				});

				queue.appendTo($this);

				$this.player('update_state');
			}

			$this.addClass('player');
		},

		queue: function (id) {
			var $this = $(this);

			if (!$.isArray(id))
			{
				id = [id];
			}

			$.ajax({
				url: '/player/queue/' + id.join(','),
				type: 'PUT',
				complete: function () {
					$this.player('update_state');
				}
			});
		},

		dequeue: function (id) {
			if (!$.isArray(id))
			{
				id = [id];
			}

			$.ajax({url: '/player/dequeue/' + id.join(','), type: 'PUT'});
		},

		update_state: function () {
			var $this = $(this);

			var pgs = $('#player .progress').data('playing');

			if (pgs && pgs.timeout)
			{
				clearTimeout(pgs.timeout);
				pgs.timeout = 0;
			}

			$.getJSON('/player', function (data) {
				if (data.shuffle)
				{
					$('#button_shuffle').addClass('toggled');
				}
				else
				{
					$('#button_shuffle').removeClass('toggled');
				}

				if (data.repeat)
				{
					$('#button_repeat').addClass('toggled');
				}
				else
				{
					$('#button_repeat').removeClass('toggled');
				}

				if (data.mute)
				{
					$('#button_mute').addClass('toggled');
				}
				else
				{
					$('#button_mute').removeClass('toggled');
				}

				$('#volume_progress').css('width', (data.volume * 100) + '%');

				var playing = $('#playing');
				var progress = $('#player .progress');

				if (progress)
				{
					var d = progress.data('playing');

					if (d && d.timeout)
					{
						clearTimeout(d.timeout);
						d.timeout = 0;
					}
				}

				playing.empty();

				if (data.playing)
				{
					$('#button_play').addClass('toggled');
				}
				else
				{
					$('#button_play').removeClass('toggled');
				}

				if (data.current.length)
				{
					var header = {};

					$.each(data.header, function (index, name) {
						header[name] = index;
					});

					var div = $('<div/>', {
						html: data.current[header.name],
						'class': 'song'
					});

					div.appendTo(playing);

					div = $('<div/>', {
						html: 'by ' + data.current[header.artist],
						'class': 'artist'
					});

					div.appendTo(playing);

					div = $('<div/>', {
						html: 'from ' + data.current[header.album],
						'class': 'album'
					});

					div.appendTo(playing);

					div = $('<div/>', {
						'class': 'progress'
					});

					div.data('playing', {
						'duration': data.current[header.duration],
						'time': data.current[header.time],
						'id': data.current[header.id]
					});

					var pdur = $('#playing_duration');
					pdur.empty();

					div.appendTo(pdur);

					div = $('<div/>', {
						id: 'duration_text'
					});

					div.appendTo(playing);

					$this.player('update_duration');
				}
				else
				{
					var div = $('<div/>', {
						html: 'Not Playing...'
					});

					div.appendTo(playing);
				}
			});

			$this.player('update_queue');
		},

		append_queue: function (header, item, after, delay) {
			var $this = $(this);
			var queue = $('#queue');
			var div = $('<div/>', {
				id: 'queued_' + item[header.id],
				'class': 'queued',
			});

			div.data('queued', {id: item[header.id]});

			$('<div/>', {html: item[header.name], 'class': 'song'}).appendTo(div);
			$('<div/>', {html: item[header.artist], 'class': 'artist'}).appendTo(div);

			var but = $('<input/>', {type: 'button', value: 'x'});

			but.bind('click', function (e) {
				$this.player('dequeue', item[header.id]);
				div.children().fadeOut();
	
				div.animate({width: 0}, function () {
					div.animate({margin_left: 0}, function () {
						div.remove();
					});
				});
			});

			but.appendTo(div);

			if (after)
			{
				div.insertAfter(after);
			}
			else
			{
				div.appendTo(queue);
			}

			if (!delay)
			{
				delay = 0;
			}

			div.css('opacity', 0);

			if (delay > 0)
			{
				setTimeout(function () {
					div.animate({opacity: 1}, {duration: 500});
					return false;
				}, delay);
			}
			else
			{
				div.animate({opacity: 1}, {duration: 500});
			}

			return div;
		},

		update_queue: function () {
			var $this = $(this);

			$.getJSON('/player/queue', function (data) {
				var header = {};
				var queue = $('#queue');

				$.each(data.header, function (index, elem) {
					header[elem] = index;
				});

				var pgs = $('#player .progress').data('playing');

				if (pgs && data.items && data.items.length && data.items[0][header.id] == pgs.id)
				{
					data.items.shift();
				}

				var items = {};

				/* First remove all items that are no longer existing */
				$.each(data.items, function (index, item) {
					items[item[header.id]] = item;
				});

				var remove = [];

				$('#queue .queued').each(function (index, queued) {
					var id = $(queued).data('queued').id;

					if (!items[id])
					{
						$(queued).animate({
							width: 0,
							margin: 0
						},
						function () {
							$(queued).remove();
						});
					}
				});

				var last = undefined;
				var timeout = 0;

				$.each(data.items, function (index, item) {
					var d = $('#queued_' + item[header.id]);

					if (d.length)
					{
						last = d;
					}
					else
					{
						last = $this.player('append_queue', header, item, last, timeout);
						timeout += 50;
					}
				});
			});
		},

		update_duration: function () {
			var $this = $(this);
			var progress = $('#playing_duration .progress');
			var data = progress.data('playing');

			var perc = (data.time / data.duration) * 100;

			if (perc >= 100)
			{
				perc = 100;
				progress.addClass('complete');
			}

			progress.width(perc + '%');

			var time = parseInt(data.time);

			var text = Utils.format_duration(time) + ' of ' + Utils.format_duration(data.duration);

			var dtext = $('#duration_text');

			if (dtext.html() != text)
			{
				dtext.html(text);
			}

			if (perc < 100)
			{
				if ($('#button_play').hasClass('toggled'))
				{
					data.timeout = setTimeout(function () {
						data.time += 0.2;
						$this.player('update_duration');
						return false;
					}, 200);
				}
			}
			else
			{
				data.timeout = 0;

				$this.player('update_state_delayed');
			}
		},

		update_state_delayed: function () {
			var $this = $(this);

			setTimeout(function () {
				$this.player('update_state');
				return false;
			}, 1000);
		},

		stop_duration: function () {
			var $this = $(this);
			var pgs = $('#playing_duration .progress').data('playing');

			if (pgs && pgs.timeout)
			{
				clearTimeout(pgs.timeout);
				pgs.timeout = 0;
			}
		},

		volume: function (volume) {
			$.ajax('/player/volume/' + volume, {
				type: 'PUT',
				complete: function () {
					$('#volume_progress').css('width', (volume * 100) + '%');
				}
			});
		},

		mute: function () {
			var button = $('#button_mute');
			var $this = $(this);

			var v = '0';

			if (!button.hasClass('toggled'))
			{
				v = '1';
			}

			$.ajax({
				url: '/player/mute/' + v,
				type: 'PUT',
				complete: function () {
					$this.player('update_state_delayed');

					button.toggleClass('toggled');
				}
			});
		},

		play: function () {
			var button = $('#button_play');
			var $this = $(this);

			$this.player('stop_duration');

			if (button.hasClass('toggled'))
			{
				$.ajax({
					url: '/player/pause',
					type: 'PUT',
					complete: function () {
						$this.player('update_state_delayed');
						button.removeClass('toggled');
					}
				});
			}
			else
			{
				$.ajax({
					url: '/player/play',
					type: 'PUT',
					complete: function () {
						$this.player('update_state_delayed');
						button.addClass('toggled');
					}
				});
			}
		},

		next: function () {
			var $this = $(this);

			$this.player('stop_duration');

			$.ajax({
				url: '/player/next',
				type: 'PUT',
				complete: function () {
					$this.player('update_state_delayed');
				}
			});
		},

		previous: function () {
			var $this = $(this);

			$this.player('stop_duration');

			$.ajax({
				url: '/player/previous',
				type: 'PUT',
				complete: function () {
					$this.player('update_state_delayed');
				}
			});
		},

		repeat: function () {
			var button = $('#button_repeat');
			var $this = $(this);

			var v = '0';

			if (!button.hasClass('toggled'))
			{
				v = '1';
			}

			$.ajax({
				url: '/player/repeat/' + v,
				type: 'PUT',
				complete: function () {
					button.toggleClass('toggled');
				}
			});
		},

		shuffle: function () {
			var button = $('#button_shuffle');
			var $this = $(this);

			var v = '0';

			if (!button.hasClass('toggled'))
			{
				v = '1';
			}

			$.ajax({
				url: '/player/shuffle/' + v,
				type: 'PUT',
				complete: function () {
					button.toggleClass('toggled');
				}
			});
		},

		playlist: function (src, id, callback) {
			if (!$.isArray(id))
			{
				id = [id];
			}

			$.ajax({url: '/player/playlist/' + src + '/' + id.join(','), type: 'PUT', complete: function () {
				if (callback)
				{
					callback.call(this);
				}
			}});
		},

		destroy: function () {
			return this.each(function () {
				var $this = $(this),
				    data = $this.data('player');

				$(window).unbind('player');
				data.player.remove();
				$this.removeData('player');
			})
		}
	};

	$.fn.player = function(method) {
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
			$.error('Method ' + method + ' does not exist on jQuery.player');
		}
	};
})(jQuery);

/* vi:ex:ts=4 */
