class Environment {
    constructor (parent) {
        this.vars = Object.create(parent ? parent.vars : null);
        this.parent = parent;
    }

    extend () {
        return new Environment(this);
    }

    lookup (name) {
        let scope = this;
        while (scope) {
            if (Object.prototype.hasOwnProperty.call(scope.vars, name)){
                return scope;
            }
            scope = scope.parent;
        }
    }

    get (name) {
        if (name in this.vars) {
            return this.vars[name];
        }
        throw new Error(`Undefined variable "${name}"`);
    }

    set (name, value) {
        let scope = this.lookup(name);
        return (scope || this).vars[name] = value;
    }

    def (name, value) {
        return this.vars[name] = value;
    }
}

function evaluate (ast, env) {
    switch (ast.type) {
        case 'File':
            return evaluate(ast.program, env);
        case 'Program':
            let val;
            ast.body.forEach(node => val = evaluate(node, env));
            return val;
        case 'ExpressionStatement':
            return evaluate(ast.expression, env);
        case 'CallExpression':
            let func = evaluate(ast.callee, env);
            return func.apply(null, ast.arguments.map(arg => {
                return evaluate(arg, env);
            }));
        case 'Identifier':
            return env.get(ast.name);
        case 'StringLiteral':
            return ast.value;
        case 'NumericLiteral':
            return ast.value;
        default:
            throw new Error(`Cannot evaluate this code`);
    }
}

function evaluateCPS (ast, env, callback) {
    switch (ast.type) {
        case 'File':
            evaluateCPS(ast.program, env, callback);
            return;
        case 'Program':
            (function loop (val, i) {
                if (i < ast.body.length) {
                    evaluateCPS(ast.body[i], env, function (v) {
                        loop(v, i + 1);
                    })
                } else {
                    callback(val);
                }
            })(undefined, 0);
            return;
        case 'ExpressionStatement':
            evaluateCPS(ast.expression, env, callback);
            return;
        case 'CallExpression':
            evaluateCPS(ast.callee, env, function (func) {
                (function loop (args, i) {
                    if (i < ast.arguments.length) {
                        evaluateCPS(ast.arguments[i], env, function (v) {
                            args[i + 1] = v;
                            loop(args, i + 1);
                        })
                    } else {
                        func.apply(null, args);
                    }
                })([callback], 0)
            });
            return;
        case 'Identifier':
            callback(env.get(ast.name));
            return;
        case 'StringLiteral':
        case 'NumericLiteral':
            callback(ast.value);
            return;
        default:
            throw new Error(`Cannot evaluate this code`);
    }
}