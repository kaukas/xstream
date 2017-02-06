/// <reference path="../../typings/globals/mocha/index.d.ts" />
/// <reference path="../../typings/globals/node/index.d.ts" />
import {Promise} from 'es6-promise';
import {EventEmitter} from 'events';
import xs from '../../src/index';
import fromEvent from '../../src/extra/fromEvent';
import concat from '../../src/extra/concat';
import * as assert from 'assert';

describe('concat (extra)', () => {
  it('should concatenate two synchronous short streams together', (done: any) => {
    const stream1 = xs.of(1, 2, 3);
    const stream2 = xs.of(40, 50, 60, 70);
    const stream3 = xs.of(8, 9);
    const stream = concat(stream1, stream2, stream3);
    const expected = [1, 2, 3, 40, 50, 60, 70, 8, 9];

    stream.addListener({
      next: (x: number) => {
        assert.equal(x, expected.shift());
      },
      error: (err: Error) => done(err),
      complete: () => {
        assert.equal(expected.length, 0);
        done();
      },
    });
  });

  it('should concatenate two asynchronous short streams together', (done: any) => {
    const stream1 = xs.periodic(50).take(3);
    const stream2 = xs.periodic(100).take(2);
    const stream = concat(stream1, stream2);
    const expected = [0, 1, 2, 0, 1];

    stream.addListener({
      next: (x: number) => {
        assert.equal(x, expected.shift());
      },
      error: (err: Error) => done(err),
      complete: () => {
        assert.equal(expected.length, 0);
        done();
      },
    });
  });

  it('should append a synchronous stream after an asynchronous stream', (done: any) => {
    const stream1 = xs.periodic(50).take(3);
    const stream2 = xs.of(30, 40, 50, 60);
    const stream = concat(stream1, stream2);
    const expected = [0, 1, 2, 30, 40, 50, 60];

    stream.addListener({
      next: (x: number) => {
        assert.equal(x, expected.shift());
      },
      error: (err: Error) => done(err),
      complete: () => {
        assert.equal(expected.length, 0);
        done();
      },
    });
  });

  it('should sequentially concatenate a promise stream with an EventEmitter stream, out of order', (done: any) => {
    let promiseResolver: (value: number) => void;
    const eventEmitter = new EventEmitter();

    const stream1 = xs.fromPromise(new Promise((resolve) => {
      promiseResolver = resolve;
    }));
    const stream2 = fromEvent(eventEmitter, 'test');
    const stream = concat(stream1, stream2);
    const expected = [0, 1];

    stream.addListener({
      next: (x: number) => {
        assert.equal(x, expected.shift());
      },
      error: (err: Error) => done(err),
      complete: () => {
        assert.equal(expected.length, 0);
        done();
      },
    });

    setTimeout(() => eventEmitter.emit('test', 1));
    setTimeout(() => promiseResolver(0));
  });

  it('should sequentially concatenate a promise stream with an EventEmitter stream, in order', (done: any) => {
    let promiseResolver: (value: number) => void;
    const eventEmitter = new EventEmitter();

    const stream1 = xs.fromPromise(new Promise((resolve) => {
      promiseResolver = resolve;
    }));
    const stream2 = fromEvent(eventEmitter, 'test');
    const stream = concat(stream1, stream2);
    const expected = [0, 1];

    stream.addListener({
      next: (x: number) => {
        assert.equal(x, expected.shift());
      },
      error: (err: Error) => done(err),
      complete: () => {
        assert.equal(expected.length, 0);
        done();
      },
    });

    setTimeout(() => promiseResolver(0));
    setTimeout(() => eventEmitter.emit('test', 1));
  });
});
