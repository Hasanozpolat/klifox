// Re-patching global structure mapping since I needed to rewrite `simulation.js` entirely earlier, I will use single drop-in rather than rewrite.
const ogStart = App.Simulation.start;
App.Simulation.start = function() {
    ogStart.call(this);
    this.timerRefs.push(setInterval(() => {
        if (App.Engine.Economy) App.Engine.Economy.tickEcosystem();
    }, 12000));
};
