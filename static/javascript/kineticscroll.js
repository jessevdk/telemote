(function ($) {
	var methods = {
		init: function (options) {
			var $this = $(this),
			    data = $this.data('kineticscroll');

			var settings = {
				damping: 0.9
			};

			$.extend(settings, options);

			if (data)
			{
				return $this;
			}

			$this.data('kineticscroll', settings);

			$this.bind('touchstart', function (e) {
				$this.kineticscroll('touchstart', e);
			});

			$this.bind('touchmove', function (e) {
				$this.kineticscroll('touchmove', e);
			});

			$this.bind('touchend', function (e) {
				$this.kineticscroll('touchend', e);
			});

			return $this;
		},

		touchstart: function (e) {
			var $this = $(this),
			    data = $this.data('kineticscroll');

			if (data.scroll && data.scroll.timeout)
			{
				clearTimeout(data.scroll.timeout);
				data.scroll.timeout = 0;
			}

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
				v: 0,
				timeout: 0
			};
		},

		touchmove: function (e) {
			var $this = $(this),
			    data = $this.data('kineticscroll');

			if (e.targetTouches.length != 1)
			{
				return false;
			}

			var x = e.targetTouches[0].clientX;
			var y = e.targetTouches[0].clientY;

			var dy = data.scroll.y - y;

			var t = (new Date()).getTime();
			var v = (y - data.scroll.last.y) / (t - data.scroll.last.t) * 1000.0;

			data.scroll.v = v;

			data.scroll.last.x = x;
			data.scroll.last.y = y;
			data.scroll.last.t = t;

			$this.scrollTop(data.scroll.scroll_top + dy);
		},

		touchend: function (e) {
			var $this = $(this),
			    data = $this.data('kineticscroll');

			$this.kineticscroll('scroll_and_damp');
		},

		scroll_and_damp: function () {
			var $this = $(this),
			    data = $this.data('kineticscroll');

			var dt = jQuery.fx.interval;
			var dts = dt / 1000.0;

			/* Integrate position */
			$this.scrollTop($this.scrollTop() - data.scroll.v * dts);

			/* Damp velocity */
			data.scroll.v *= data.damping;

			if (Math.abs(data.scroll.v) > 10)
			{
				data.scroll.timeout = setTimeout(function () {
					$this.kineticscroll('scroll_and_damp');
				}, dt);
			}
			else
			{
				data.scroll.timeout = 0;
			}
		},
	};

	$.fn.kineticscroll = function(method) {
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
			$.error('Method ' + method + ' does not exist on jQuery.kineticscroll');
		}
	};
})(jQuery);

/* vi:ex:ts=4 */
