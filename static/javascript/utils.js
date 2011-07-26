var Utils =
{
	header_map: function (header) {
		var ret = {};

		$.each(header, function (index, elem) {
			ret[elem] = index;
		});

		return ret;
	},

	prefix_zero: function (i)
	{
		if (i < 10)
		{
			return '0' + i;
		}
		else
		{
			return i;
		}
	},

	format_duration: function (seconds) {
		var hours = parseInt(seconds / 3600);
		seconds = seconds % 3600;

		var minutes = parseInt(seconds / 60);
		seconds = seconds % 60;

		if (hours > 0)
		{
			return hours + ':' + Utils.prefix_zero(minutes) + ':' + Utils.prefix_zero(seconds);
		}
		else
		{
			return minutes + ':' + Utils.prefix_zero(seconds);
		}
	}
};

