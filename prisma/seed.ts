import { PrismaClient } from '@prisma/client';
import { DEFAULT_USERS } from '../src/utils/userManagement';
import { DIRECTORY_DATA as directoryItems, TOOLKIT_15_STAGES } from '../src/data/mockData';


import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Database...');

  // Seed Users
  for (const user of DEFAULT_USERS) {
    await prisma.authUser.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id || undefined,
        name: user.name,
        role: user.role,
        facilityTypes: user.role === 'owner' ? JSON.stringify(['hospital']) : null,
        email: user.email,
        phone: user.phone || null,
        company: user.company || null,
        isSubscribed: user.isSubscribed || false,
        plan: user.plan || null,
        status: user.status || 'active',
      }
    });
  }
  console.log(`Seeded ${DEFAULT_USERS.length} users.`);

  // Seed Directory Items
  for (const item of directoryItems) {
    await prisma.directoryItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        name: item.name,
        role: item.role,
        category: item.category,
        rating: item.rating,
        reviewsCount: item.reviewsCount,
        location: item.location,
        serviceLocations: JSON.stringify(item.serviceLocations),
        projectStages: JSON.stringify(item.projectStages),
        productsAndServices: JSON.stringify(item.productsAndServices),
        description: item.description,
        verified: item.verified,
        yearsOfExperience: item.yearsOfExperience,
        contactEmail: item.contactEmail,
        phone: item.phone,
        website: item.website,
        featuredProject: item.featuredProject,
        clientPortfolio: JSON.stringify(item.clientPortfolio || []),
        gstin: item.gstin,
        priceRange: item.priceRange,
        turnaroundTime: item.turnaroundTime,
        certifications: JSON.stringify(item.certifications || []),
        headquartersAddress: item.headquartersAddress,
        complianceBadges: JSON.stringify(item.complianceBadges || [])
      }
    });
  }
  console.log(`Seeded ${directoryItems.length} directory items.`);

  // Seed Facility Types
  const facilityTypes = [
    { id: 'hospital', name: 'Hospital', description: 'General hospital facility' },
    { id: 'diagnostic-center', name: 'Diagnostic Center', description: 'Imaging and diagnostic labs' },
    { id: 'clinic', name: 'Clinic', description: 'Outpatient clinic' },
    { id: 'rehab-center', name: 'Rehab Center', description: 'Rehabilitation and recovery center' },
  ];

  for (const ft of facilityTypes) {
    await prisma.facilityType.upsert({
      where: { id: ft.id },
      update: {},
      create: ft
    });
  }
  console.log(`Seeded ${facilityTypes.length} facility types.`);

  // Seed Stages for Hospital
  for (const stage of TOOLKIT_15_STAGES) {
    await prisma.stageItem.upsert({
      where: { id: `hospital-stage-${stage.stageNumber}` },
      update: {},
      create: {
        id: `hospital-stage-${stage.stageNumber}`,
        stageNumber: stage.stageNumber,
        title: stage.title,
        category: stage.category,
        summary: stage.summary,
        keyDeliverables: JSON.stringify(stage.keyDeliverables),
        checklist: JSON.stringify(stage.checklist),
        typicalTimeline: stage.typicalTimeline,
        keyStakeholders: JSON.stringify(stage.keyStakeholders),
        facilityTypeId: 'hospital',
      }
    });
  }
  console.log(`Seeded ${TOOLKIT_15_STAGES.length} stages for Hospital.`);
  
  // Seed placeholder stages for other facilities
  for (const ft of facilityTypes.filter(f => f.id !== 'hospital')) {
    for (let i = 1; i <= 3; i++) {
      await prisma.stageItem.upsert({
        where: { id: `${ft.id}-stage-${i}` },
        update: {},
        create: {
          id: `${ft.id}-stage-${i}`,
          stageNumber: i,
          title: `Stage ${i}: ${i === 1 ? 'Planning' : i === 2 ? 'Execution' : 'Launch'}`,
          category: 'General',
          summary: `Placeholder summary for ${ft.name} stage ${i}`,
          keyDeliverables: JSON.stringify(['Deliverable 1', 'Deliverable 2']),
          checklist: JSON.stringify(['Task 1', 'Task 2']),
          typicalTimeline: '1-3 Months',
          keyStakeholders: JSON.stringify(['Promoter']),
          facilityTypeId: ft.id,
        }
      });
    }
  }
  console.log(`Seeded placeholder stages for other facilities.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
