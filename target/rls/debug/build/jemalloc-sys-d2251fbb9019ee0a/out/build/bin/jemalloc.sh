#!/bin/sh

prefix=/Users/andonmitev/Desktop/RUst/hello_world/target/rls/debug/build/jemalloc-sys-d2251fbb9019ee0a/out
exec_prefix=/Users/andonmitev/Desktop/RUst/hello_world/target/rls/debug/build/jemalloc-sys-d2251fbb9019ee0a/out
libdir=${exec_prefix}/lib

DYLD_INSERT_LIBRARIES=${libdir}/libjemalloc.2.dylib
export DYLD_INSERT_LIBRARIES
exec "$@"
