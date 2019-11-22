const defaultOpt =  {size: 25, change_percent:0.5, exchange_percent: 0.5};

const randomInt = (start, end) =>  (Math.floor(start + (Math.random() * (end - start))))

const chr2str = (lst) => (lst.map(c=> String.fromCharCode(c)).join(''))

const createFathers = (targetAscii, sz) => (Array(sz).fill(null).map(() => (
    targetAscii.map(
            () => (randomInt(' '.charCodeAt(0), '~'.charCodeAt(0)+1))
    ))
))

const check = (targetAscii, toCheck) => (
    toCheck.reduce((acc, cur, idx) => (
        acc + Math.abs(cur - targetAscii[idx])
    ), 0)
)

// O(n) 时间空间 递归
const checkAll = (targetAscii, fathers, idx=0) => {
    if(check(targetAscii, fathers[idx]) === 0)
        return idx
    else
        return ((idx<fathers.length-1) && checkAll(targetAscii, fathers, idx+1))
}

// O(n^2 * len)
function cossover(fathers, check) {
    if (fathers.length === 1) return fathers;
    const len = fathers[0].length;
    let nextGen = []
    for(let i=0;i<fathers.length- 1;i++) {
        for (let j=i+1;j<fathers.length;j++) {
            const child1 = [...fathers[i].slice(0, len / 2), ...fathers[j].slice(len / 2)]
            const child2 = [...fathers[j].slice(0, len / 2), ...fathers[i].slice(len / 2)]
            nextGen.push(check(child1) < check(child2) ? child1 : child2)
        }
    }
    return nextGen.sort((a, b) => (check(a) - check(b))).slice(0, fathers.length)
}

const variation_exchange_each = (item, percent) => {
    if(Math.random() < percent) {
        const n = randomInt(0, item.length)
        const k = randomInt(0, item.length)
        const tmp = item[n]
        item[n] = item[k]
        item[k] = tmp
    }
    return item
}

const variation_change_each = (item, percent) => {
    if(Math.random() < percent)
        item[randomInt(0, item.length)] = randomInt(' '.charCodeAt(0), '~'.charCodeAt(0)+1)
    return item
}

const next_gen = (fathers, cossover_curry, variation_change_each_curry, variation_exchange_each_curry) => (
    cossover_curry(fathers).map(item => (
        [variation_change_each_curry, variation_exchange_each_curry].reduce((acc, cur, idx) => (acc = cur(acc)), item)
        )
))


const iter_gen = (targetAscii, fathers, opt, cb = (()=> {})) => {
    let cnt = 0
    let gen = fathers
    let flag = checkAll(targetAscii, gen)
    const cossover_curry = (fathers) => cossover(fathers, (a) => (check(targetAscii, a)))
    const variation_change_each_curry = (fathers) => variation_change_each(fathers, opt.change_percent)
    const variation_exchange_each_curry = (fathers) => variation_exchange_each(fathers, opt.exchange_percent)
    while(flag === false) {
        gen = next_gen(gen, cossover_curry, variation_change_each_curry, variation_exchange_each_curry)
        cb(chr2str(gen[0]))
        flag = checkAll(targetAscii, gen)
        cnt++
    }
    return [gen[flag], cnt]
}

const generateTarget = (targetStr, opt=defaultOpt, cb = () => {}) => {
    if(typeof opt === 'function') {
        cb = opt;
        opt = defaultOpt
    }
    const targetAscii = targetStr.split('').map(c => ((c.charCodeAt(0))))
    const fathers = createFathers(targetAscii, opt.size)
    const [result, cnt] = iter_gen(targetAscii, fathers, opt, cb);
    cb(chr2str(result))
    return [result, cnt]
}

const generateTargetWithHistory = (targetStr, opt=defaultOpt) => {
    const ret = []
    generateTarget(targetStr, opt, (txt) => {
        ret.push(txt);
    })
    return ret
}
