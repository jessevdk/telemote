var Utils =
{
	header_map: function (header) {
		var ret = {};

		$.each(header, function (index, elem) {
			ret[elem] = index;
		});

		return ret;
	}
};

