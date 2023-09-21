const fs = require('fs');
const chalk = require('chalk')
var AsciiTable = require('ascii-table')
var table = new AsciiTable()
table.setHeading('SelectMenu', 'Stats').setBorder('|', '=', "0", "0")

module.exports = (client) => {
    fs.readdirSync('./Menus/').filter((file) => file.endsWith('.js')).forEach((file) => {
        const selectMenu = require(`../Menus/${file}`)
        client.selectMenu.set(selectMenu.id, selectMenu)
		table.addRow(selectMenu.id, '✅')
    })
		console.log(chalk.cyanBright(table.toString()))
};
