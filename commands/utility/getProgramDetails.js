const { SlashCommandBuilder } = require("discord.js");
const { fetchData } = require("./../../intigritiApi");

module.exports = {
  // Define the slash command

  data: new SlashCommandBuilder()
    .setName("program_details")
    .setDescription("Returns the details of programs.")
    .addStringOption((option) =>
      option
        .setName("program_name")
        .setDescription("The name of the program to get details for.")
        .setRequired(true)
    ),
  // Execute the command
  async execute(interaction) {
    try {
      // Defer the reply until the data is fetched
      await interaction.deferReply();

      // Get the program name from the interaction options
      const programName = interaction.options.getString("program_name");

      // Fetch all programs
      const allProgramsResponse = await fetchData(
        "/external/researcher/v1/programs?limit=200"
      );

      // Find the target program from the fetched programs
      const targetProgram = allProgramsResponse.records.find(
        (program) => program.name.toLowerCase() === programName.toLowerCase()
      );

      // If the target program is found
      if (targetProgram) {
        // Fetch the details of the target program
        const programDetailsResponse = await fetchData(
          `/external/researcher/v1/programs/${targetProgram.id}`
        );

        // Get the program details from the response
        const programDetail = programDetailsResponse;

        // Create an embed message with the program details
        const embed = {
          color: 0x0099ff,
          title: `Details for the program "${programDetail.name}"`,
          fields: [
            { name: "ID", value: programDetail.id },
            { name: "Handle", value: programDetail.handle },
            {
              name: "Confidentiality Level",
              value: programDetail.confidentialityLevel.value,
            },
            { name: "Status", value: programDetail.status.value },
            { name: "Type", value: programDetail.type.value },
            {
              name: "Rules of Engagement",
              value: programDetail.rulesOfEngagement.content.description,
            },
            {
              name: "Domains",
              value: formatDomains(programDetail.domains.content),
            },
            {
              name: "Testing Requirements",
              value: formatTestingRequirements(
                programDetail.rulesOfEngagement.content.testingRequirements
              ),
            },
          ],
          timestamp: new Date(),
          footer: {
            text: "IntigritiHelper",
          },
        };

        // Send the embed message
        await interaction.editReply({ embeds: [embed] });
      } else {
        // If the target program is not found, send an error message
        await interaction.editReply(
          `Program **"${programName}"** was not found.`
        );
      }
    } catch (error) {
      // Log any errors
      console.error(
        "[command program_details] Error fetching program details:",
        error
      );
      // Send an error message
      await interaction.editReply({
        content: "Something went wrong, check console for errors.",
        ephemeral: true,
      });
    }
  },
};
// Function to format the domains information into a string

function formatDomains(domains) {
  const domainString = domains
    .map(
      (domain) =>
        // Create a string with the domain details

        `Endpoint: ${domain.endpoint}\nType: ${domain.type.value}\nTier: ${
          domain.tier.value
        }\nDescription: ${domain.description || "N/A"}`
    )
    .join("\n\n");

  return domainString;
}

// Function to format the testing requirements into a string
function formatTestingRequirements(testingRequirements) {
  return `Intigriti.me: ${
    testingRequirements.intigritiMe
  }\nAutomated Tooling: ${testingRequirements.automatedTooling}\nUser Agent: ${
    testingRequirements.userAgent || "N/A"
  }\nRequest Header: ${testingRequirements.requestHeader || "N/A"}`;
}
