export const SKILLS_CATALOG = [
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Frontend & Fullstack',
    icon: 'Code2',
    description: 'ES6+, closures, event loop, promises, prototypes, and async patterns.',
    durationMinutes: 5,
    questionsCount: 5
  },
  {
    id: 'react',
    name: 'React',
    category: 'Frontend',
    icon: 'Layers',
    description: 'Hooks, virtual DOM, component lifecycles, reconciliation, and state management.',
    durationMinutes: 5,
    questionsCount: 5
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'Backend',
    icon: 'Server',
    description: 'Event-driven architecture, streams, buffer, clustering, and REST APIs.',
    durationMinutes: 5,
    questionsCount: 5
  },
  {
    id: 'python',
    name: 'Python',
    category: 'Backend & Data/AI',
    icon: 'Cpu',
    description: 'OOP, decorators, generators, list comprehensions, and memory management.',
    durationMinutes: 5,
    questionsCount: 5
  },
  {
    id: 'java',
    name: 'Java',
    category: 'Backend & Enterprise',
    icon: 'Terminal',
    description: 'JVM architecture, multithreading, collections framework, and OOP design patterns.',
    durationMinutes: 5,
    questionsCount: 5
  },
  {
    id: 'cpp',
    name: 'C++',
    category: 'Systems & Performance',
    icon: 'Zap',
    description: 'Pointers, memory allocation, STL, move semantics, and RAII principles.',
    durationMinutes: 5,
    questionsCount: 5
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'Database',
    icon: 'Database',
    description: 'Document models, aggregation pipelines, indexing, sharding, and replication.',
    durationMinutes: 5,
    questionsCount: 5
  }
];

export const QUESTION_BANKS = {
  'JavaScript': [
    {
      id: 'js-1',
      question: 'Which statement accurately describes JavaScript closures?',
      options: [
        'A closure is a function bundled together with references to its lexical environment.',
        'A closure is a method to immediately terminate memory allocation.',
        'A closure is a syntax error caused by unclosed curly braces.',
        'A closure is a built-in browser DOM animation engine.'
      ],
      correctOption: 0,
      explanation: 'A closure gives a function access to its outer scope from an inner function even after the outer function has executed.'
    },
    {
      id: 'js-2',
      question: 'What will `typeof NaN` evaluate to in JavaScript?',
      options: [
        '"undefined"',
        '"nan"',
        '"number"',
        '"object"'
      ],
      correctOption: 2,
      explanation: 'In JavaScript according to the IEEE 754 floating point specification, NaN (Not-a-Number) is of type "number".'
    },
    {
      id: 'js-3',
      question: 'What is the key difference between microtasks and macrotasks in the JavaScript Event Loop?',
      options: [
        'Macrotasks execute before all microtasks at every turn.',
        'Microtasks (e.g. Promise.then) execute immediately after the current script and before any rendering or macrotask.',
        'Microtasks run on a separate CPU thread, while macrotasks run on the main thread.',
        'There is no operational difference in Node or modern browsers.'
      ],
      correctOption: 1,
      explanation: 'The microtask queue is drained completely after the currently running task, before the browser renders or moves to the next macrotask (setTimeout, setInterval).'
    },
    {
      id: 'js-4',
      question: 'What is the purpose of `Object.freeze()` compared to `Object.seal()`?',
      options: [
        '`freeze` prevents adding, deleting, and modifying existing properties; `seal` prevents adding/deleting but allows modifying existing writable properties.',
        '`seal` makes the object immutable, while `freeze` only prevents deletion.',
        '`freeze` only works on arrays, whereas `seal` works on objects.',
        'Both methods perform identical shallow and deep immutability.'
      ],
      correctOption: 0,
      explanation: 'Object.freeze() makes an object entirely read-only (prevents editing, adding, and deleting), whereas Object.seal() allows editing existing writable properties.'
    },
    {
      id: 'js-5',
      question: 'What does the `??` (Nullish Coalescing) operator check for?',
      options: [
        'Falsy values: false, 0, "", null, undefined, NaN',
        'Only strictly `null` or `undefined`',
        'Zero and empty strings only',
        'Undefined variable references without declaration'
      ],
      correctOption: 1,
      explanation: 'Unlike || which checks for any falsy value (including 0, false, and ""), ?? only checks for null and undefined.'
    }
  ],

  'React': [
    {
      id: 'react-1',
      question: 'Why must React Hook calls not be placed inside loops, conditions, or nested functions?',
      options: [
        'React relies on the fixed call order of hooks across renders to maintain component state correctly.',
        'Hooks placed in loops will cause the browser memory to leak automatically.',
        'Babel compiler fails to parse conditional hook statements.',
        'Hooks can only be called from inside Class component constructors.'
      ],
      correctOption: 0,
      explanation: 'React maintains an internal linked-list / index array of hooks and depends on deterministic execution order on every render.'
    },
    {
      id: 'react-2',
      question: 'What is the purpose of `useCallback` in React?',
      options: [
        'To cache the calculated return value of an expensive mathematical computation.',
        'To return a memoized version of the callback function that only changes if dependencies change.',
        'To trigger an asynchronous background API fetch automatically.',
        'To bind class methods to the React component instance.'
      ],
      correctOption: 1,
      explanation: 'useCallback memoizes callback function references to avoid unnecessary re-renders in memoized child components.'
    },
    {
      id: 'react-3',
      question: 'When does the cleanup function returned by `useEffect` execute?',
      options: [
        'Only when the browser window is closed or refreshed.',
        'Before the component unmounts and before re-running the effect on dependency change.',
        'Immediately after the initial DOM paint before any state changes.',
        'Only if an unhandled JavaScript exception occurs inside the effect.'
      ],
      correctOption: 1,
      explanation: 'React executes the cleanup function when the component unmounts and prior to re-running the effect on subsequent renders.'
    },
    {
      id: 'react-4',
      question: 'What is the primary benefit of React Fiber architecture?',
      options: [
        'It allows incremental rendering by splitting rendering work into chunks and pausing/prioritizing updates.',
        'It eliminates the need for JavaScript by compiling directly to WebAssembly.',
        'It replaces HTML5 CSS styling with native C++ shaders.',
        'It forces all state to be stored in localStorage automatically.'
      ],
      correctOption: 0,
      explanation: 'React Fiber is a complete rewrite of React reconciliation engine that enables time-slicing and priority-based interruptible rendering.'
    },
    {
      id: 'react-5',
      question: 'What is the correct way to update state that depends on the previous state in React?',
      options: [
        '`setCount(count + 1)`',
        '`setCount(prev => prev + 1)`',
        '`this.state.count++`',
        '`count = count + 1; refresh()`'
      ],
      correctOption: 1,
      explanation: 'Using the functional updater `setCount(prev => prev + 1)` ensures that concurrent batching operates on the guaranteed latest state value.'
    }
  ],

  'Node.js': [
    {
      id: 'node-1',
      question: 'How does Node.js achieve high concurrency despite running on a single main JavaScript thread?',
      options: [
        'By utilizing the libuv event loop and thread pool for non-blocking I/O operations.',
        'By spawning a separate operating system process for each HTTP request.',
        'By running multiple V8 engines concurrently on separate CPU cores for each function.',
        'By compiling JavaScript into synchronous machine bytecode on runtime.'
      ],
      correctOption: 0,
      explanation: 'Node.js leverages libuv which delegates I/O tasks to OS kernels and an internal thread pool while keeping the JS execution single-threaded.'
    },
    {
      id: 'node-2',
      question: 'What is the difference between `process.nextTick()` and `setImmediate()` in Node.js?',
      options: [
        '`process.nextTick()` fires immediately after current operation completes before the event loop continues; `setImmediate()` runs on the Check phase of the event loop.',
        '`setImmediate()` runs before any microtask queue execution.',
        '`process.nextTick()` is deprecated in favor of setTimeout(0).',
        'Both methods run simultaneously in the Timer phase.'
      ],
      correctOption: 0,
      explanation: 'process.nextTick() executes immediately after the current operation before the event loop advances to the next phase.'
    },
    {
      id: 'node-3',
      question: 'What is a Node.js Stream and why is it preferred for large files?',
      options: [
        'A stream processes data piece-by-piece (in chunks) without loading the entire payload into RAM.',
        'A stream is a synchronous buffer that compresses files using GZIP.',
        'A stream is an encrypted WebSocket protocol exclusively for audio.',
        'A stream prevents CPU throttling on Linux servers.'
      ],
      correctOption: 0,
      explanation: 'Streams allow processing continuous chunks of data, enabling memory-efficient processing of gigabyte-sized files.'
    },
    {
      id: 'node-4',
      question: 'Which module in Node.js is used to create child processes that can share server ports?',
      options: [
        '`cluster`',
        '`worker_threads`',
        '`v8`',
        '`crypto`'
      ],
      correctOption: 0,
      explanation: 'The `cluster` module enables creating child processes (forks) that share server ports to utilize multi-core systems.'
    },
    {
      id: 'node-5',
      question: 'What happens if an unhandled promise rejection occurs in modern Node.js versions (v15+)?',
      options: [
        'The process prints a warning and continues silently.',
        'The Node.js process terminates with a non-zero exit code.',
        'The rejection is caught by garbage collector and ignored.',
        'The server automatically restarts on port 8080.'
      ],
      correctOption: 1,
      explanation: 'In Node.js v15+, unhandled promise rejections trigger an unhandledRejection event and terminate the process by default.'
    }
  ],

  'Python': [
    {
      id: 'py-1',
      question: 'What is the Global Interpreter Lock (GIL) in CPython?',
      options: [
        'A mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously.',
        'A security sandbox that disables file system writing in production.',
        'A database lock that prevents SQLite write conflicts.',
        'A compiler optimization that speeds up for-loops by 10x.'
      ],
      correctOption: 0,
      explanation: 'The GIL ensures that only one thread executes Python bytecode at a time in CPython to simplify memory management.'
    },
    {
      id: 'py-2',
      question: 'What is the key difference between a Python Generator and a standard function?',
      options: [
        'A generator uses `yield` to return an iterator that produces values lazily one at a time.',
        'A generator cannot accept parameters or use loops.',
        'A generator runs on GPU threads automatically.',
        'A generator creates a deep copy of all local variables.'
      ],
      correctOption: 0,
      explanation: 'Generators yield values on demand without allocating memory for the entire sequence in advance.'
    },
    {
      id: 'py-3',
      question: 'What is the output of `[i*2 for i in range(4) if i % 2 == 0]`?',
      options: [
        '`[0, 4]`',
        '`[0, 2, 4, 6]`',
        '`[2, 6]`',
        '`[0, 1, 2, 3]`'
      ],
      correctOption: 0,
      explanation: 'i takes values 0 and 2. Multiplying each by 2 yields [0, 4].'
    },
    {
      id: 'py-4',
      question: 'In Python, how do `*args` and `**kwargs` function in method signatures?',
      options: [
        '`*args` collects positional arguments into a tuple, while `**kwargs` collects keyword arguments into a dictionary.',
        '`*args` is for integer arguments, `**kwargs` is for string arguments.',
        '`*args` creates a pointer reference, `**kwargs` creates a reference to a reference.',
        'Both are strictly required to define lambda expressions.'
      ],
      correctOption: 0,
      explanation: '*args receives variable non-keyword arguments as a tuple, and **kwargs receives variable keyword arguments as a dict.'
    },
    {
      id: 'py-5',
      question: 'What is the purpose of Python `__slots__` in a class definition?',
      options: [
        'It restricts attribute creation to explicit names and optimizes memory by avoiding `__dict__` creation.',
        'It sets the maximum number of instances that can be created.',
        'It locks all class methods against inheritance.',
        'It enables asynchronous class instantiation.'
      ],
      correctOption: 0,
      explanation: '__slots__ eliminates the overhead of dynamic attribute dictionaries per object, saving substantial memory in large scale instances.'
    }
  ],

  'Java': [
    {
      id: 'java-1',
      question: 'What is the difference between `String`, `StringBuilder`, and `StringBuffer` in Java?',
      options: [
        '`String` is immutable; `StringBuilder` is mutable and non-thread-safe (fast); `StringBuffer` is mutable and thread-safe (synchronized).',
        '`StringBuffer` is immutable, while `String` is mutable.',
        '`StringBuilder` cannot be used in multithreaded applications under any circumstances.',
        'All three classes share the identical performance profile in Java 17+.'
      ],
      correctOption: 0,
      explanation: 'String objects cannot be changed once created. StringBuilder is un-synchronized and faster, whereas StringBuffer has synchronized methods for thread safety.'
    },
    {
      id: 'java-2',
      question: 'Which Java Garbage Collection mechanism manages short-lived objects in the Heap?',
      options: [
        'Young Generation (Eden & Survivor Spaces)',
        'Old (Tenured) Generation',
        'Metaspace (Permanent Generation)',
        'Native Code Cache'
      ],
      correctOption: 0,
      explanation: 'New objects are allocated in the Eden space within the Young Generation and collected during Minor GC cycles.'
    },
    {
      id: 'java-3',
      question: 'What is the purpose of the `volatile` keyword in Java?',
      options: [
        'It ensures that updates to a variable are immediately visible to all threads by preventing CPU caching.',
        'It prevents a variable from ever being modified after initialization.',
        'It serializes an object into encrypted JSON format.',
        'It automatically cleans the object from RAM when nullified.'
      ],
      correctOption: 0,
      explanation: 'volatile guarantees memory visibility across threads by reading and writing directly to main memory rather than CPU register caches.'
    },
    {
      id: 'java-4',
      question: 'In Java Streams API, what is the difference between intermediate and terminal operations?',
      options: [
        'Intermediate operations (e.g. `map`, `filter`) are lazy and return a new Stream; terminal operations (e.g. `collect`, `forEach`) trigger execution and consume the stream.',
        'Intermediate operations execute immediately, while terminal operations are stored in memory.',
        'Terminal operations can be chained indefinitely.',
        'There is no functional distinction in Java.'
      ],
      correctOption: 0,
      explanation: 'Intermediate operations prepare a pipeline without executing until a terminal operation is invoked.'
    },
    {
      id: 'java-5',
      question: 'What is the time complexity of `HashMap.get()` in Java under ideal hashing conditions?',
      options: [
        'O(1)',
        'O(log n)',
        'O(n)',
        'O(n log n)'
      ],
      correctOption: 0,
      explanation: 'With a uniform hash distribution without collision clustering, HashMap retrieval operations operate in constant O(1) time.'
    }
  ],

  'C++': [
    {
      id: 'cpp-1',
      question: 'What is RAII (Resource Acquisition Is Initialization) in C++?',
      options: [
        'A design pattern where resource lifetime is bound to object lifetime, ensuring automatic cleanup upon stack unwinding.',
        'A runtime compiler flag that disables memory leaks automatically.',
        'A legacy syntax used before C++11 for pointer declarations.',
        'An instruction to allocate variables on heap memory only.'
      ],
      correctOption: 0,
      explanation: 'RAII guarantees that resources (memory, file handles, sockets) are automatically released in destructors when scope exits.'
    },
    {
      id: 'cpp-2',
      question: 'What is the difference between `std::unique_ptr` and `std::shared_ptr`?',
      options: [
        '`std::unique_ptr` enforces single exclusive ownership with zero overhead; `std::shared_ptr` uses reference counting for shared ownership.',
        '`std::shared_ptr` cannot be moved, only copied.',
        '`std::unique_ptr` requires manual calling of `delete`.',
        'Both have identical reference counting mechanisms.'
      ],
      correctOption: 0,
      explanation: 'unique_ptr cannot be copied (only moved) and has no reference-counter overhead, while shared_ptr maintains a thread-safe control block.'
    },
    {
      id: 'cpp-3',
      question: 'What is the purpose of `std::move` in modern C++?',
      options: [
        'It casts an lvalue to an rvalue reference, enabling move constructors/assignment without copying data.',
        'It moves an object from stack memory to CPU cache.',
        'It deletes an object and sets pointer to nullptr.',
        'It copies an object across thread boundaries.'
      ],
      correctOption: 0,
      explanation: 'std::move is an unconditional cast to an rvalue reference, signaling that the resource can be transferred rather than copied.'
    },
    {
      id: 'cpp-4',
      question: 'Why should a base class destructor almost always be declared `virtual` in C++?',
      options: [
        'To prevent undefined behavior when deleting a derived class object through a pointer to the base class.',
        'To increase virtual method execution speed by 2x.',
        'To make the class abstract and un-instantiable.',
        'Virtual destructors are strictly required by all C++ compilers.'
      ],
      correctOption: 0,
      explanation: 'If a base destructor is not virtual, deleting via a base pointer invokes only the base destructor, leaking derived class resources.'
    },
    {
      id: 'cpp-5',
      question: 'What is the time complexity of searching an element in `std::map` vs `std::unordered_map` in C++?',
      options: [
        '`std::map` is O(log n) (Red-Black Tree); `std::unordered_map` is average O(1) (Hash Table).',
        'Both are strictly O(1) in all scenarios.',
        '`std::map` is O(n), while `std::unordered_map` is O(log n).',
        '`std::unordered_map` requires binary search O(log n).'
      ],
      correctOption: 0,
      explanation: 'std::map is a self-balancing binary search tree (O(log n)), while std::unordered_map is a hash table with average O(1) lookup.'
    }
  ],

  'MongoDB': [
    {
      id: 'mongo-1',
      question: 'What is the purpose of the MongoDB Aggregation Pipeline?',
      options: [
        'To process and transform documents through sequential stages (e.g. `$match`, `$group`, `$project`, `$sort`).',
        'To create multi-threaded database connections for NodeJS.',
        'To automatically migrate SQL schemas into BSON documents.',
        'To compress database files on disk.'
      ],
      correctOption: 0,
      explanation: 'The aggregation pipeline allows complex data processing, filtering, grouping, and transformations across multi-document collections.'
    },
    {
      id: 'mongo-2',
      question: 'What is the primary difference between an Embedding data model and a Referencing data model in MongoDB?',
      options: [
        'Embedding stores related data within the same document for fast atomic reads; Referencing stores IDs pointing to other collections to avoid duplication and 16MB document limits.',
        'Embedding only works with numbers, while Referencing only works with text.',
        'Embedding is deprecated in MongoDB 6.0+.',
        'Referencing requires a relational SQL server running alongside MongoDB.'
      ],
      correctOption: 0,
      explanation: 'Embedding optimizes read performance via subdocuments; referencing normalizes data across collections using ObjectIds.'
    },
    {
      id: 'mongo-3',
      question: 'What is a Compound Index in MongoDB and how does the index prefix rule apply?',
      options: [
        'An index on multiple fields; queries can utilize the index if they query a leading prefix of the indexed fields in order.',
        'An index that automatically duplicates data to multiple replica sets.',
        'An index that only accelerates string searches.',
        'A compound index can be queried in any arbitrary field order without restriction.'
      ],
      correctOption: 0,
      explanation: 'A compound index on `{a: 1, b: 1, c: 1}` supports queries on `{a}`, `{a, b}`, and `{a, b, c}`, but not `{b}` or `{c}` alone.'
    },
    {
      id: 'mongo-4',
      question: 'What is the maximum BSON document size allowed in MongoDB?',
      options: [
        '16 Megabytes',
        '64 Megabytes',
        '1 Gigabyte',
        'Unlimited'
      ],
      correctOption: 0,
      explanation: 'The maximum BSON document size is 16MB to prevent excessive RAM utilization and ensure efficient network transit.'
    },
    {
      id: 'mongo-5',
      question: 'What is the role of a Replica Set Primary node in MongoDB?',
      options: [
        'The Primary node receives all write operations and records operations in its oplog for secondaries to replicate.',
        'The Primary node only serves read-only queries while secondaries handle writes.',
        'The Primary node is solely an arbiter that cannot store data.',
        'The Primary node is replaced every 60 seconds automatically.'
      ],
      correctOption: 0,
      explanation: 'The primary receives all write operations and maintains the oplog that secondaries sync to maintain high availability.'
    }
  ]
};
