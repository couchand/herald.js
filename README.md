Herald: A New (Promise-like) API
================================

From the Promises/A+ spec:
>  A promise represents a value that may not be available yet. The primary method for interacting with a promise is its `then` method.

My response:

_A herald represents a piece of information.  In an asynchronous world, you must assume all information is not available yet.  Heralds have a number of simple yet expressive methods for interaction._

This object is more than just a promise.  It has just a little bit of semantics:  it carries a little information.  It is a Herald.

I've only just been writing this gist and already I like how the terminology anthropomorphizes the software pattern. 

History
-------

This project started after spending much time thinking about asychronous coding, specifically while working on the force.js project.  The philosophy and strategy behind this library was first described in a series of gists.

 * <https://gist.github.com/couchand/d851e4ea181a466034d8>
 * <https://gist.github.com/couchand/fe83a3820fe153d227cd>
 * <https://gist.github.com/couchand/1485a952b56329c6b122>
 * <https://gist.github.com/couchand/a966d762668f93f7d0b8>

Nuts and Bolts
--------------

Ok, every other API gets it wrong from the start.  I don't like manually invoking constructors, especially in JavaScript.

```js
// ugly
var promise = new promise.Deferred();

// better, encapsulates ugliness
var my_herald = herald();
```

Sure the second version is just a sugary version of the first, but it saves many keystrokes.

Moreover, it enforces something that I think should be a more universally recognized feature of JavaScript: duck typing.  You should never care what the name of the constructor of an object is.  That's too much detail in the internals of the library.  Instead, you should rely on the public API, which should be purely functional.


The herald stands ready
-----------------------

Next up, resolution options!  In the standard formulation, a promise can be:

 * resolved
 * rejected
 * making progress

I've always thought the last one, though neat, is not all that important.  But it can be useful for debugging, so let's have some idea of ongoing progress.  We also need those definitive states of completion and error.  Let's add:

```js
herald.dispatch( some_val );    // ~= resolve
herald.dismiss( error_val );    // ~= reject
herald.notify( progress_val );  // ~= progress
```

Just like the behaviour you'd expect from a promise, once a herald has been `dispatched` it can never be `dismissed` nor can it be `dispatched` again.  Also, once a herald has been `dismissed` it can no longer be `dispatched`.  Also, a herald can only be `notified` until it has been `dispatched` or `dismissed`.  Let's summarize that information:

 * A `Herald` is created in a pending state (`awaiting` or `vigilant`)
 * While `awaiting` a `Herald` can be `notified` repeatedly
 * While `awaiting` a `Herald` can be `dispatched`, putting it in a completed state (`dispatched`)
   * Once `dispatched` a `Herald` cannot be `notified`, `dispatched` or `dismissed`
 * While `awaiting` a `Herald` can be `dismissed`, putting it in an error state (`dismissed`)
   * Once `dismissed` a `Herald` cannot be `notified`, `dispatched` or `dismissed`

Ok, so far we've proven that we can use a thesaurus effectively.

Let's add a few sugar methods to observe the state.

```js
herald.awaiting();
herald.dispatched();
herald.dismissed();
```

Oh semantic predicates.

Observing the herald
--------------------

Just like a promise, you can attach handlers to a herald.  However, unlike Promises/A et al., there is not a single monolithic `then` method.  A herald is rather more like jQuery's Deferred object, with its more meaningful handler attachment.

However jQuery goes too far the other way.  Their Deferred API has 18 different methods with such confusing names as `fail`, `reject`, and `rejectWith` (one of them attaches callbacks, guess which one?).

We dispense with the limitations of the Promises/A spec as well as the complexity of jQuery's design.  There is simply a single method in parallel with each of the three API methods previously mentioned.

 * To await a herald's `dispatch`, use the `then` method
 * To await a herald's `dismissal`, use the `rescue` method
 * To await a `notification` to the herald, use the `listen` method

<del>Those names suck as much as jQuery's.  Let's think of better ones.</del>

These names actually seem pretty good.  (Way better than the previous names `watch` and `observe` or something).

Herald management
-----------------

Pretty quickly we know we need to combine several heralds together, and we also need to normalize heralded and non-heralded values.  We'll introduce a method analogous to a promise's `when` method.

```js
var both_things_happened = herald.await( one_thing, and_the_other );
var this_is_a_herald = herald.await( plain_value );
```

One thing to note: we will introduce a special case: if the only parameter to `await` is an array, and the first element of that array is itself a herald, the function `herald.await` will be applied to the array.  This is to enable:

```js
var all_the_things = herald.await( array_of_heralded_items );
```

But means it's not possible, with await, to create an immediate herald for an array containing a herald at the zero index.  Fear not, because that second form of `herald.await` was really just sugar for:

```js
var some_heralded_value = herald.immediate( plain_value );
```
Mmm that's convenient.

And now we recall that our constructor, by design, takes no parameters.  Which means, if you pass parameters, you definitely don't want a plain vanilla herald.  Perhaps you would like to await the things you passed in?

```js
var page_loader = herald( got_stuff, got_more_stuff, got_the_styling, rendered );
var all_the_things = herald( array_of_items );
var the_answer =  herald(42);
```

Mmmm that's really convenient.  Sometimes you'll want to be explicit and say `herald.immediate('foo')` or `herald.await(some, slow, things)`, but really, wouldn't you rather just say `herald('foo')` and `herald(those, slow, things)`?

One more sugar method, just for the hell of it.  This one's so easy i'm implementing it here.

```js
Herald.prototype.and = function() {
  var heralds = Array.prototype.slice.call(arguments);
  heralds.splice(0, 0, this);  // We might want to do something more complex in the
  return herald( heralds );    //   case that this is already a composite herald...
};
```

This enables us to do some cool things.

```js
var all_the_things = herald(
  one_thing,
  another_thing,
  yet_another_thing
).and(
  one_last_thing
);
```

Wow, pointlessly beautiful.  Perhaps more practically.

```js
var one_thing = slow_running_operation();
var other_thing = async_operation();

// equivalent to herald( one_thing, other_thing );
var both_things = one_thing.and( other_thing );
```

Let's get dirty
---------------
