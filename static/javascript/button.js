(function ($) {
	var methods = {
		init: function (options) {
			var $this = $(this);

			$this.css('cursor', 'pointer');

			if (!$this.attr('ontouchstart'))
			{
				$this.bind('click', function (e) {
					$this.addClass('pressed');

					setTimeout(function () {
						$this.removeClass('pressed');
					}, 100);
				});
			}
			else
			{
				$this.bind('touchstart', function (e) {
					$(e.target).addClass('pressed');
				});

				$this.bind('touchend', function (e) {
					$(e.target).removeClass('pressed');
				});
			}

			return $this;
		}
	};

	$.fn.button = function(method) {
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
			$.error('Method ' + method + ' does not exist on jQuery.button');
		}
	};
})(jQuery);

/* vi:ex:ts=4 */
