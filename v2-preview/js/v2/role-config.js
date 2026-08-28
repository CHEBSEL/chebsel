export const ROLE_CONFIG={
 president:{label:'Président',menus:[['members','👥','Membres'],['secretariat','🗃️','Secrétariat'],['treasury','💼','Trésorerie'],['reports','📚','Rapports Mensuels'],['archives','🗂️','Archives'],['conflicts','⚖️','Journal des conflits'],['settings','⚙️','Paramètres'],['privacy','🔒','Confidentialité'],['about','ℹ️','À propos']]},
 secretary:{label:'Secrétaire',menus:[['members','👥','Membres'],['attendance','✅','Appel'],['attendance-history','📈','Historique'],['punctuality-reports','📊','Rapports ponctualité'],['debtors','📋','Débiteurs'],['archives','🗂️','Sauvegarde & Archives']]},
 treasurer:{label:'Trésorier',menus:[['members','👥','Membres'],['payments','💰','Paiements'],['debtors','📋','Débiteurs'],['expenses','💸','Dépenses'],['finance-history','📈','Historique / Histogramme'],['finance-reports','📊','Rapports financiers'],['archives','🗂️','Sauvegarde & Archives']]},
 visitor:{label:'Visiteur',menus:[['members','👥','Membres'],['debtors','📋','Débiteurs']]}
};
export function getRoleConfig(role){return ROLE_CONFIG[role]||ROLE_CONFIG.visitor}
