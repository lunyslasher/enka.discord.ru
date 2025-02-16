import { Client, Interaction } from 'discord.js';
import { commands } from '../..';

export default async function (client: Client) {
    client.on('interactionCreate', async (interaction) => {
        let finder: string;
        if (!('commandName' in interaction)) {
            finder = interaction.customId;
        } else {
            finder = interaction.commandName;
        }
        const command = commands.get(finder);
        if (!command) return;
        console.log(`Executing interaction ${finder}...`);
        try {
            if(interaction.isAutocomplete() && command.role === "CHAT_INPUT") {
                command.autocomplete ? await command.autocomplete(interaction) : console.error("Couldn't complete autocomplete interaction");
                return;
            }
            await (command.run as (interaction: Interaction) => unknown)(
                interaction,
            );
            console.log(`Interaction ${finder} executed successfully!`);
        } catch (error) {
            console.log(`Error while executing interaction ${finder}:`);
            console.error(error);
            if (interaction.isCommand()) {
                if (interaction.deferred || interaction.replied)
                    await interaction.editReply({
                        content:
                            'При выполнении этой команды произошла ошибка!',
                    });
                else
                    await interaction.reply({
                        content:
                            'При выполнении этой команды произошла ошибка!',
                        ephemeral: true,
                    });
            }
        }
    });
}
