import { Command } from "../../../types/discord";
import {db} from "../../../utils/db";
import {users} from "../../../schema";
import {eq} from "drizzle-orm";
import {MessageFlagsBitField} from "discord.js";

export default {
    custom_id: "account_disconnect",
    role: "BUTTON",
    run: async (interaction) => {
        if (interaction.user.id !== interaction.message.interactionMetadata?.user.id) {
            return interaction.reply({
                content: "Вы не можете взаимодействовать с командой другого пользователя",
                flags: MessageFlagsBitField.Flags.Ephemeral,
            });
        }
        await interaction.deferUpdate();

        const user = await db.query.users.findFirst({ where: eq(users.id, interaction.user.id) });

        if(!user || !user.enka_name) {
            await interaction.editReply({ content: "У вас нет подключенной учетной записи", embeds: [], components: [] });
            return;
        }

        await db.delete(users).where(eq(users.id, interaction.user.id)).execute();

        await interaction.editReply({ content: "Учетная запись успешно отключена", embeds: [], components: [] });
    },
} satisfies Command;
