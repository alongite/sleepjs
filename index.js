let $code = document.querySelector('#code');

let parsed = Babel.transform($code.innerText, {
    ast: true,
    presets: ['env']
});

console.log(parsed);

let $output = document.querySelector('#output');
let env = new Environment();
env.def('print', function (str) {
    $output.innerText += ` ${str}`;
});
env.def('sleep', function (second) {
    $output.innerText += ` sleep${second}`;
})

evaluate(parsed.ast, env);


let $outputCPS = document.querySelector('#output-cps');
let envCPS = new Environment();
envCPS.def('print', function (callback, str) {
    $outputCPS.innerText += ` ${str}`;
    callback();
});
envCPS.def('sleep', function (callback, second) {
    setTimeout(function () {
        $outputCPS.innerText += ` sleep${second}`;
        callback();
    }, second * 1000);
})

evaluateCPS(parsed.ast, envCPS, function (ret) {
    console.log(ret);
});



// let $outputCPS = document.querySelector('#output-cps');
// let envCPS = new Environment();
// envCPS.def('callCC', function (callback, func) {
//     func(callback, function (cb, ret) {
//         callback(ret);
//     })
// });

// evaluateCPS(parsed.ast, envCPS, function (ret) {
//     console.log(ret);
// });