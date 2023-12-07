const { SlashCommandBuilder } = require("discord.js");
const { fetchData } = require("./../../intigritiApi");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("all_programs")
    .setDescription(
      "This command returns all the programs the user has access to in their program overview."
    ),
  async execute(interaction) {
    try {
      const response = await fetchData("/external/researcher/v1/programs");
      const programs = response.records;

      if (programs && programs.length > 0) {
        const embed = {
          color: 0x0099ff,
          title: "Available Programs",
          fields: programs.map((program) => ({
            name: program.name,
            value: `**ID:** ${program.id}\n**Min Bounty:** ${program.minBounty.value} ${program.minBounty.currency}\n**Max Bounty:** ${program.maxBounty.value} ${program.maxBounty.currency}`,
          })),
          timestamp: new Date(),
          footer: {
            text: "IntigritiHelper",
          },
        };
        await interaction.reply({ embeds: [embed] });
      } else {
        await interaction.reply("Something went wrong.. probably.");
      }
    } catch (error) {
      console.error("[command all_programs] Error fetching programs:", error);
      await interaction.reply(
        "Something went wrong, check console for errors."
      );
    }
  },
};
