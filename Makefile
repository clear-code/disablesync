PACKAGE_NAME = disablesync

all: xpi

xpi:
	./makexpi.sh -n $(PACKAGE_NAME)
