var initializing = true;

function current_source()
{
	var selection = $('#playlists').playlists('listview').listview('selected');

	if (selection)
	{
		return selection[0].id;
	}
}

function animate_activate(elements, timeout, times, callback)
{
	if (times == 0)
	{
		callback(elements);
		return;
	}

	elements.toggleClass('selected');

	setTimeout(function () { animate_activate (elements, timeout, times - 1, callback)}, timeout);
}

$(document).ready(function () {
	$('body').bind('touchmove', function (e) {
		e.preventDefault();
	});

	$('#playlists').playlists({
		listview: {
		    selection_changed: function () {
		        $('#artists').artists('refresh', current_source());
		    }
		},
		loaded: function () {
		    $(this).playlists('listview').listview('select_index', 0);
		}
	});
	$('#artists').artists({
		listview: {
		    selection_changed: function () {
		        var src = current_source();
		        var selection = $.map(this.listview('selected'),
		                              function (item) {
		                                  return item.id;
		                              });

		        $('#songs').songs('refresh', src, selection);
		    }
		},
		loaded: function () {
		    $(this).artists('listview').listview('select_index', 1);
		}
	});
	$('#songs').songs({
		listview: {
		    activated: function (rows) {
		        animate_activate(rows.target, 100, 6, function () {
		            $('#player').player('queue', rows.data.id);
		        });
		    }
		},
		queued: function (row) {
		    animate_activate(row.target, 100, 6, function () {
		        $('#player').player('queue', row.data.id);
		    });
		}
	});

	$('#player').player({
		setplaylist: function () {set_playlist($('#setplaylist'))}
	});
});

function set_playlist(button)
{
	$(button).addClass('pressed');

	var src = current_source();
	var listview = $('#songs').songs('listview');
	var selection = listview.listview('selected');

	if (!selection || selection.length == 0)
	{
		selection = listview.listview('rows');
	}

	var ids = $.map(selection, function (item) {
		return item.id;
	});

	setTimeout(function () {
		$(button).removeClass('pressed');
	}, 100);

	$('#player').player('playlist', src, ids, function () {
		$('#playlists').playlists('refresh');
	});
}


/* vi:ex:ts=4 */
