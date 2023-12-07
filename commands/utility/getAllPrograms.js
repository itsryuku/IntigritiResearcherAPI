const { SlashCommandBuilder } = require("discord.js");
const { fetchData } = require("./../../intigritiApi");

module.exports = {
  // Define the slash command
  data: new SlashCommandBuilder()
    .setName("all_programs")
    .setDescription(
      "This command returns all the programs the user has access to in their program overview."
    ),
  // Execute the command
  async execute(interaction) {
    try {
      // Defer the reply until the data is fetched
      await interaction.deferReply();
      // Fetch the data from the API
      const response = await fetchData(
        "/external/researcher/v1/programs?limit=200" // default returns 50, returning 200 to get all programs
      );
      const programs = response.records;

      // Check if there are any programs
      if (programs && programs.length > 0) {
        // Create an embed message with the programs and their details
        const embed = {
          color: 0x0099ff,
          title: "Available Programs",
          fields: programs.map(({ name, id, minBounty, maxBounty }) => ({
            name,
            value: `**ID:** ${id}\n**Min Bounty:** ${minBounty.value} ${minBounty.currency}\n**Max Bounty:** ${maxBounty.value} ${maxBounty.currency}`,
          })),
          timestamp: new Date(),
          footer: {
            text: "IntigritiHelper",
          },
        };
        // Send the embed message
        await interaction.editReply({ embeds: [embed] });
      } else {
        // If there are no programs, send an error message
        await interaction.editReply(
          "Something went wrong check console for errors."
        );
      }
    } catch (error) {
      // Log any errors
      console.error("[command all_programs] Error fetching programs:", error);
      // Send an error message
      await interaction.editReply(
        "Something went wrong, check console for errors."
      );
    }
  },
};
