all : converter dither

converter : converter.c
	gcc -o $@ $^ -lm

dither : dither.cpp
	g++ -o $@ $^ -lgd

clean :
	rm -rf converter *~
	rm -rf dither *~


