#include <Python.h>
#include <rhythmdb/rhythmdb.h>
#include <rhythmdb/rhythmdb-query-model.h>
#include <pygobject.h>

static PyObject *TeleMoteCError;

static gboolean
obj_as_number (PyObject *obj, int *val)
{
	PyObject *numval;

	numval = PyNumber_Long (obj);

	if (!numval)
	{
		return FALSE;
	}


	*val = PyInt_AsLong (numval);
	Py_DECREF (numval);

	return TRUE;
}

static gboolean
obj_as_string (PyObject *obj, gchar **val)
{
	PyObject *strval;

	strval = PyObject_Str (obj);

	if (!strval)
	{
		return FALSE;
	}

	*val = g_strdup (PyString_AsString (strval));
	Py_DECREF (strval);

	return TRUE;
}

static PyObject *
query_model_new (PyObject *self, PyObject *args)
{
	RhythmDB *db;
	RhythmDBQuery *q;
	ssize_t num;
	ssize_t i;
	RhythmDBQueryModel *model;

	num = PySequence_Size (args);

	if (num < 1)
	{
		PyErr_SetString (TeleMoteCError, "Please provide the query database");
		return NULL;
	}

	db = RHYTHMDB (pygobject_get (PySequence_GetItem (args, 0)));

	if (!RHYTHMDB_IS (db))
	{
		PyErr_SetString (TeleMoteCError, "Provided db is not a database");
		return NULL;
	}

	q = rhythmdb_query_parse (db, RHYTHMDB_QUERY_END);

	i = 1;

	while (i < num)
	{
		int qtype;

		if (!obj_as_number (PySequence_GetItem (args, i), &qtype))
		{
			g_object_unref (q);
			return NULL;
		}

		if (qtype == RHYTHMDB_QUERY_SUBQUERY)
		{
			PyErr_SetString (TeleMoteCError, "Subquery is not supported");
			g_object_unref (q);
			return NULL;
		}

		if (qtype != RHYTHMDB_QUERY_DISJUNCTION)
		{
			int ptype;
			gchar *s = NULL;
			GValue sval = {0,};

			if (!obj_as_number (PySequence_GetItem (args, i + 1), &ptype))
			{
				g_object_unref (q);
				return NULL;
			}

			if (!obj_as_string (PySequence_GetItem (args, i + 2), &s))
			{
				g_object_unref (q);
				return NULL;
			}

			g_value_init (&sval, G_TYPE_STRING);
			g_value_take_string (&sval, s);

			rhythmdb_query_append_params (db, q, qtype, ptype, &sval);
			g_value_unset (&sval);

			i += 2;
		}
		else
		{
			rhythmdb_query_append_params (db, q, qtype, 0, NULL);
		}

		++i;
	}

	model = rhythmdb_query_model_new (db, q, NULL, NULL, NULL, FALSE);
	rhythmdb_query_free (q);

	return pygobject_new (G_OBJECT (model));
}

static PyObject *
query_model_do (PyObject *self, PyObject *args, PyObject *kwargs)
{
	PyObject *pydb;
	PyObject *pymodel;
	RhythmDB *db;
	RhythmDBQueryModel *model;
	RhythmDBQuery *query;
	static gchar *keywords[] = {"db", "model", NULL};

	if (!PyArg_ParseTupleAndKeywords (args, kwargs, "OO", keywords, &pydb, &pymodel))
	{
		return NULL;
	}

	db = RHYTHMDB (pygobject_get (pydb));
	model = RHYTHMDB_QUERY_MODEL (pygobject_get (pymodel));

	g_object_get (model, "query", &query, NULL);

	rhythmdb_do_full_query_parsed (db,
	                               RHYTHMDB_QUERY_RESULTS (model),
	                               query);

	Py_INCREF (Py_None);
	return Py_None;
}

static PyMethodDef TeleMoteCMethods[] =
{
	{"query_model_new", query_model_new, METH_VARARGS, "Query model new"},
	{"query_model_do", (PyCFunction)query_model_do, METH_VARARGS | METH_KEYWORDS, "Query model do"},
	{NULL, NULL, 0, NULL}
};

PyMODINIT_FUNC
inittelemotec(void)
{
	PyObject *m;

	m = Py_InitModule ("telemotec", TeleMoteCMethods);

	if (!m)
	{
		return;
	}

	TeleMoteCError = PyErr_NewException("telemotec.error", NULL, NULL);
	Py_INCREF (TeleMoteCError);
	PyModule_AddObject(m, "error", TeleMoteCError);
}
