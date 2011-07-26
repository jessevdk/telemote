PKG_CONFIG=pkg-config
PACKAGES=pygobject-2.0 rhythmbox python

CFLAGS=`$(PKG_CONFIG) --cflags $(PACKAGES)`
LIBS=`$(PKG_CONFIG) --libs $(PACKAGES)`

telemotec.so: telemotec.c
	$(CC) $< -shared -fPIC -g $(CFLAGS) $(LIBS) -Wl,-soname,$@ -o $@

clean:
	rm -f telemotec.so
