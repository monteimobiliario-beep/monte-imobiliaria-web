
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'pt' | 'en';

interface TranslationDict {
  [key: string]: {
    pt: string;
    en: string;
  };
}

const translations: TranslationDict = {
  // Common
  'nav.home': { pt: 'Início', en: 'Home' },
  'nav.catalog': { pt: 'Catálogo', en: 'Catalog' },
  'nav.services': { pt: 'Serviços', en: 'Services' },
  'nav.about': { pt: 'Sobre Nós', en: 'About Us' },
  'nav.careers': { pt: 'Carreiras', en: 'Careers' },
  'nav.contact': { pt: 'Contacto', en: 'Contact' },
  'nav.login': { pt: 'Entrar', en: 'Login' },
  'nav.dashboard': { pt: 'Painel', en: 'Dashboard' },
  
  // Home View
  'hero.title': { pt: 'Encontre o seu lugar no topo.', en: 'Find your place at the top.' },
  'hero.subtitle': { pt: 'A Monte Imobiliária é a sua parceira de confiança para gestão, venda e arrendamento de imóveis em Moçambique.', en: 'Monte Imobiliária is your trusted partner for property management, sales, and leasing in Mozambique.' },
  'hero.cta': { pt: 'Consultar', en: 'Consult' },
  'hero.placeholder': { pt: 'Imagine o seu endereço...', en: 'Imagine your address...' },
  'hero.location.beira': { pt: 'Beira Exclusive', en: 'Beira Exclusive' },
  'hero.location.maputo': { pt: 'Maputo Prime', en: 'Maputo Prime' },

  'home.featured.label': { pt: 'Destaques', en: 'Featured' },
  'home.featured.title': { pt: 'Imóveis de Referência', en: 'Reference Properties' },
  'home.featured.viewall': { pt: 'Ver Tudo', en: 'View All' },
  
  'home.philosophy.tag': { pt: 'Monte Imobiliária', en: 'Monte Imobiliária' },
  'home.philosophy.title': { pt: 'Transformando Posses em Legados', en: 'Transforming Assets into Legacies' },
  'home.philosophy.desc': { pt: 'A nossa abordagem transcende o imobiliário convencional. Unimos consultoria estratégica e gestão de ativos de elite.', en: 'Our approach transcends conventional real estate. We combine strategic consulting and elite asset management.' },
  'careers.hero.title': { pt: 'Carreira na Monte Imobiliária', en: 'Careers at Monte Imobiliária' },
  'careers.hero.subtitle': { pt: 'Construa o futuro do mercado imobiliário em Moçambique connosco.', en: 'Build the future of the real estate market in Mozambique with us.' },
  'careers.hero.cta': { pt: 'Ver Oportunidades', en: 'View Opportunities' },
  'careers.vacancies.title': { pt: 'Vagas em Aberto', en: 'Open Vacancies' },
  'careers.vacancies.official': { pt: 'Vagas Oficiais', en: 'Official Vacancies' },
  'careers.vacancies.empty': { pt: 'Não existem vagas de momento.', en: 'No vacancies at the moment.' },
  'careers.vacancies.apply': { pt: 'Candidatar-se', en: 'Apply Now' },
  'careers.syncing': { pt: 'Sincronizando com a Monte Imobiliária...', en: 'Syncing with Monte Imobiliária...' },
  'careers.modal.title': { pt: 'Candidatura', en: 'Application' },
  'careers.modal.subtitle': { pt: 'Preencha os dados abaixo para iniciar o processo', en: 'Fill in the data below to start the process' },
  'careers.form.name': { pt: 'Nome Completo', en: 'Full Name' },
  'careers.form.email': { pt: 'Email Profissional', en: 'Professional Email' },
  'careers.form.phone': { pt: 'Telefone / WhatsApp', en: 'Phone / WhatsApp' },
  'careers.form.linkedin': { pt: 'LinkedIn ou Portfólio', en: 'LinkedIn or Portfolio' },
  'careers.form.cv': { pt: 'Link do CV (Google Drive/PDF)', en: 'CV Link (Google Drive/PDF)' },
  'careers.form.letter': { pt: 'Link da Carta de Manifestação', en: 'Cover Letter Link' },
  'careers.form.message': { pt: 'Apresentação / Comentário', en: 'Introduction / Comment' },
  'careers.form.msg_placeholder': { pt: 'Conte-nos brevemente sobre a sua experiência...', en: 'Tell us briefly about your experience...' },
  'careers.form.consent': { pt: 'Autorizo a Monte Imobiliária a processar os meus dados para fins de recrutamento.', en: 'I authorize Monte Imobiliária to process my data for recruitment purposes.' },
  'careers.form.submit': { pt: 'Submeter Candidatura', en: 'Submit Application' },
  'careers.success.title': { pt: 'Candidatura Registada!', en: 'Application Registered!' },
  'careers.success.desc': { pt: 'O seu perfil foi guardado na nossa base de talentos.', en: 'Your profile has been saved in our talent database.' },
  'careers.success.whatsapp': { pt: 'Enviar via WhatsApp', en: 'Send via WhatsApp' },
  'careers.success.email': { pt: 'Enviar via Email', en: 'Send via Email' },
  'careers.success.back': { pt: 'Voltar ao Portal', en: 'Back to Portal' },
  'careers.form.email_pref': { pt: 'Prefere enviar por email?', en: 'Prefer sending by email?' },
  'careers.form.email_button': { pt: 'Enviar Candidatura via Email', en: 'Send Application via Email' },
  'careers.form.email_hint': { pt: 'Anexe o seu CV em formato PDF (Máx. 5MB).', en: 'Attach your CV in PDF format (Max. 5MB).' },

  // Header
  'header.search': { pt: 'Pesquisar imóvel ou local...', en: 'Search property or location...' },
  'header.no_results': { pt: 'Sem resultados', en: 'No results' },
  'nav.tagline': { pt: 'Gestão de Propriedades', en: 'Property Management' },

  // Dashboard
  'dash.syncing': { pt: 'Sincronizando dados...', en: 'Syncing data...' },
  'dash.revenue': { pt: 'Receita Total', en: 'Total Revenue' },
  'dash.revenue.desc': { pt: 'Entradas Brutas', en: 'Gross Inflow' },
  'dash.expenses': { pt: 'Despesas Reais', en: 'Actual Expenses' },
  'dash.expenses.desc': { pt: 'Saídas Operacionais', en: 'Operational Outflow' },
  'dash.profit': { pt: 'Lucro Líquido', en: 'Net Profit' },
  'dash.profit.desc': { pt: 'Performance Mensal', en: 'Monthly Performance' },
  'dash.employees': { pt: 'Capital Humano', en: 'Human Capital' },
  'dash.properties': { pt: 'Ativos em Carteira', en: 'Portfolio Assets' },
  'dash.pending_apps': { pt: 'Recrutamento Ativo', en: 'Active Recruitment' },
  'dash.fleet': { pt: 'Frota Operacional', en: 'Operational Fleet' },
  'dash.projects': { pt: 'Obras & Projetos', en: 'Works & Projects' },
  'dash.contacts': { pt: 'Leads & Contatos', en: 'Leads & Contacts' },
  'dash.recent_apps': { pt: 'Candidaturas Recentes', en: 'Recent Applications' },
  'dash.insight': { pt: 'Análise Estratégica AI', en: 'AI Strategic Analysis' },
  'dash.thinking': { pt: 'Analisando pulso financeiro...', en: 'Analyzing financial pulse...' },
  'dash.view_all': { pt: 'Ver Tudo', en: 'View All' },
  'dash.last_sync': { pt: 'Atualizado em', en: 'Updated at' },
  'dash.asset_dist': { pt: 'Distribuição de Ativos', en: 'Asset Distribution' },

  // Login
  'login.title': { pt: 'Entrar no Ecossistema', en: 'Enter Ecosystem' },
  'login.staff_id': { pt: 'Identificador Staff', en: 'Staff Identifier' },
  'login.security_key': { pt: 'Chave de Segurança', en: 'Security Key' },
  'login.google': { pt: 'Entrar com Google Cloud', en: 'Login with Google Cloud' },
  'login.back': { pt: 'Voltar ao Portal Público', en: 'Back to Public Portal' },
  'login.register_staff': { pt: 'Registar Novo Colaborador', en: 'Register New Staff' },
  'login.or_cloud': { pt: 'Ou use Cloud ID', en: 'Or use Cloud ID' },
  'login.monitor': { pt: 'Autentique-se com o seu e-mail corporativo. Acesso monitorizado pelo Protocolo Core 15.0.', en: 'Authenticate with your corporate email. Access monitored by Protocol Core 15.0.' },
  'login.error.creds': { pt: 'Credenciais de acesso inválidas. Verifique e-mail e senha.', en: 'Invalid credentials. Check email and password.' },

  // About 
  'about.hero.tag': { pt: 'Nossa Trajectória', en: 'Our Journey' },
  'about.hero.title': { pt: 'Sobre a', en: 'About' },
  'about.hero.subtitle': { pt: 'Liderança técnica e compromisso com o desenvolvimento imobiliário.', en: 'Technical leadership and commitment to real estate development.' },
  'about.history.title': { pt: 'História de Inovação', en: 'History of Innovation' },
  'about.history.p1': { pt: 'Fundada no coração estratégico do Bairro Alto da Manga, a Monte Imobiliária nasceu para profissionalizar o mercado imobiliário em Moçambique.', en: 'Founded in the strategic heart of the Alto da Manga neighborhood, Monte Imobiliária was born to professionalize the real estate market in Mozambique.' },
  'about.history.p2': { pt: 'Hoje, garantimos a integridade estrutural das obras, a rentabilidade de unidades hoteleiras e a transparência total na gestão de ativos.', en: 'Today, we guarantee the structural integrity of works, the profitability of hotel units, and total transparency in asset management.' },
  'about.portfolio.tag': { pt: 'Portfolio de Sucesso', en: 'Success Portfolio' },
  'about.portfolio.title': { pt: 'Projetos & Serviços', en: 'Projects & Services' },
  'about.portfolio.subtitle': { pt: 'Concluídos', en: 'Completed' },
  'about.portfolio.delivered': { pt: 'Serviço Entregue', en: 'Delivered Service' },
  'about.cta.title': { pt: 'Confie na Liderança da Monte Imobiliária', en: 'Trust the Leadership of Monte Imobiliária' },
  'about.cta.desc': { pt: 'Estamos prontos para gerir, construir e realizar o seu próximo projecto imobiliário com rigor técnico.', en: 'We are ready to manage, build, and realize your next real estate project with technical rigor.' },
  'about.cta.button': { pt: 'Falar Connosco', en: 'Talk to Us' },

  // Contact
  'contact.hero.tag': { pt: 'Suporte Especializado', en: 'Specialized Support' },
  'contact.hero.title': { pt: 'Fale com a', en: 'Talk to' },
  'contact.hero.subtitle': { pt: 'Nossa Equipa', en: 'Our Team' },
  'contact.hero.desc': { pt: 'Estamos prontos para atender as suas necessidades imobiliárias com agilidade.', en: 'We are ready to meet your real estate needs with agility.' },
  'contact.channels.title': { pt: 'Canais Diretos', en: 'Direct Channels' },
  'contact.channels.whatsapp': { pt: 'WhatsApp Business', en: 'WhatsApp Business' },
  'contact.channels.email': { pt: 'Email Oficial', en: 'Official Email' },
  'contact.channels.location': { pt: 'Localização', en: 'Location' },
  'contact.channels.hours': { pt: 'Seg - Sex: 08:00 - 17:00', en: 'Mon - Fri: 08:00 - 17:00' },
  'contact.secure.title': { pt: 'Atendimento Seguro', en: 'Secure Service' },
  'contact.secure.desc': { pt: 'Os seus dados são protegidos pela nossa infraestrutura cloud privada.', en: 'Your data is protected by our private cloud infrastructure.' },
  'contact.success.title': { pt: 'Mensagem Enviada!', en: 'Message Sent!' },
  'contact.success.desc': { pt: 'Obrigado por contactar a Monte Imobiliária. Responderemos em breve.', en: 'Thank you for contacting Monte Imobiliária. We will reply soon.' },
  'contact.success.button': { pt: 'Enviar Outra Mensagem', en: 'Send Another Message' },
  'contact.form.title': { pt: 'Envie-nos um Pedido', en: 'Send us a Request' },
  'contact.form.subtitle': { pt: 'Consultoria Técnica e Imobiliária', en: 'Technical and Real Estate Consulting' },
  'contact.form.name': { pt: 'Nome Completo', en: 'Full Name' },
  'contact.form.email': { pt: 'E-mail para Resposta', en: 'Email for Reply' },
  'contact.form.subject': { pt: 'Assunto', en: 'Subject' },
  'contact.form.message': { pt: 'Mensagem ou Descrição do Caso', en: 'Message or Case Description' },
  'contact.form.placeholder': { pt: 'Em que podemos ajudar hoje?', en: 'How can we help you today?' },
  'contact.form.submit': { pt: 'Enviar Mensagem', en: 'Send Message' },
  'contact.form.footer': { pt: 'A nossa equipa técnica responderá em até 24 horas úteis.', en: 'Our technical team will respond within 24 business hours.' },

  // Property List
  'props.hero.title': { pt: 'Explore', en: 'Explore' },
  'props.hero.subtitle': { pt: 'Legados Patrimoniais.', en: 'Heritage Legacies.' },
  'props.hero.desc': { pt: 'Uma coleção rigorosa de ativos selecionados para investidores de elite.', en: 'A rigorous collection of selected assets for elite investors.' },
  'props.filter.title': { pt: 'Filtros', en: 'Filters' },
  'props.filter.deal': { pt: 'Finalidade', en: 'Deal Type' },
  'props.filter.category': { pt: 'Categorias', en: 'Categories' },
  'props.filter.all': { pt: 'Todas', en: 'All' },
  'props.filter.todos': { pt: 'Todos', en: 'All' },
  'props.results': { pt: 'Resultados', en: 'Results' },
  'props.units': { pt: 'Unidades', en: 'Units' },
  'props.recent': { pt: 'Recentes', en: 'Recent' },
  'props.loading': { pt: 'Consultando Portfólio...', en: 'Consulting Portfolio...' },
  'props.empty.title': { pt: 'Nenhuma Correspondência', en: 'No Match Found' },
  'props.empty.desc': { pt: 'Não encontramos ativos com estes critérios exatos no momento.', en: 'We did not find assets with these exact criteria at the moment.' },
  'props.empty.button': { pt: 'Limpar Todos os Filtros', en: 'Clear All Filters' },
  'props.featured': { pt: 'Destaque', en: 'Featured' },

  // Property Types & Deals
  'type.house': { pt: 'Casa', en: 'House' },
  'type.apartment': { pt: 'Apartamento', en: 'Apartment' },
  'type.guesthouse': { pt: 'Guest House', en: 'Guest House' },
  'type.hotel': { pt: 'Hotel', en: 'Hotel' },
  'type.condo': { pt: 'Condomínio', en: 'Condo' },
  'type.land': { pt: 'Terreno', en: 'Land' },
  'deal.sale': { pt: 'Venda', en: 'Sale' },
  'deal.rent': { pt: 'Aluguel', en: 'Rent' },

  // Property Details
  'detail.back': { pt: 'Voltar ao Catálogo', en: 'Back to Catalog' },
  'detail.not_found': { pt: 'Imóvel não encontrado.', en: 'Property not found.' },
  'detail.price_label': { pt: 'Preço Venda', en: 'Sale Price' },
  'detail.share': { pt: 'Partilhar', en: 'Share' },
  'detail.verified': { pt: 'Verificado', en: 'Verified' },
  'detail.gallery.title': { pt: 'Galeria Completa', en: 'Full Gallery' },
  'detail.narrative': { pt: 'A Narrativa', en: 'The Narrative' },
  'detail.suites': { pt: 'Suítes Privativas', en: 'Private Suites' },
  'detail.bathrooms': { pt: 'Banheiros', en: 'Bathrooms' },
  'detail.area': { pt: 'Área do Terreno', en: 'Plot Area' },
  'detail.market_value': { pt: 'Valor de Mercado', en: 'Market Value' },
  'detail.condo': { pt: 'Condomínio Mensal', en: 'Monthly Condo Fee' },
  'detail.docs': { pt: 'Documentação do Imóvel', en: 'Property Documentation' },
  'detail.costs': { pt: 'Custos Transacionais', en: 'Transactional Costs' },
  'detail.interest': { pt: 'Manifestar Interesse', en: 'Express Interest' },
  'detail.amenities': { pt: 'Atributos & Conveniências', en: 'Amenities & Conveniences' },
  'detail.proximity': { pt: 'Proximidade', en: 'Proximity' },
  'detail.mobility': { pt: 'Mobilidade Estratégica', en: 'Strategic Mobility' },
  'detail.continuity': { pt: 'Continuidade', en: 'Continuity' },
  'detail.explore_more': { pt: 'Explore outros ativos da prestigiada coleção Monte Imobiliária.', en: 'Explore other assets from the prestigious Monte Imobiliária collection.' },
  'detail.view_all': { pt: 'Ver Portfólio Completo', en: 'View Full Portfolio' },
  'detail.concierge': { pt: 'Concierge VIP', en: 'VIP Concierge' },
  'detail.specialist': { pt: 'Especialista Ativo', en: 'Active Specialist' },
  'detail.form.name': { pt: 'Seu Nome', en: 'Your Name' },
  'detail.form.email': { pt: 'Seu Email', en: 'Your Email' },
  'detail.form.message': { pt: 'Sua Mensagem / Dúvida', en: 'Your Message / Inquiry' },
  'detail.success.title': { pt: 'Dados Registados!', en: 'Data Registered!' },
  'detail.success.contact': { pt: 'Como prefere ser contactado?', en: 'How do you prefer to be contacted?' },
  'detail.success.whatsapp': { pt: 'WhatsApp Directo', en: 'Direct WhatsApp' },
  'detail.success.email': { pt: 'Enviar por Email', en: 'Send by Email' },
  'detail.success.new_req': { pt: 'Novo Pedido', en: 'New Request' },
  'detail.chat.initial': { pt: 'Olá! Como posso ajudar com este imóvel?', en: 'Hello! How can I help with this property?' },
  'detail.chat.response': { pt: 'Recebemos a sua mensagem! Um dos nossos consultores irá analisar o seu pedido e responder via WhatsApp ou Email brevemente. Posso ajudar com mais alguma coisa?', en: 'We received your message! One of our consultants will analyze your request and respond via WhatsApp or Email shortly. Anything else I can help with?' },

  // Home Quick Access
  'home.access.opps.label': { pt: 'Oportunidades', en: 'Opportunities' },
  'home.access.opps.title': { pt: 'Explorar Portfólio', en: 'Explore Portfolio' },
  'home.access.services.label': { pt: 'Serviços', en: 'Services' },
  'home.access.services.title': { pt: 'Consultoria Estratégica', en: 'Strategic Consulting' },
  'home.access.mgmt.label': { pt: 'Gestão', en: 'Management' },
  'home.access.mgmt.title': { pt: 'Administração', en: 'Administration' },

  // Home Philosophy Items
  'home.curation.title': { pt: 'Curadoria', en: 'Curation' },
  'home.curation.desc': { pt: 'Seleção rigorosa.', en: 'Rigorous selection.' },
  'home.engineering.title': { pt: 'Engenharia', en: 'Engineering' },
  'home.engineering.desc': { pt: 'Soluções técnicas.', en: 'Technical solutions.' },

  // Services View
  'services.hero.tag': { pt: 'Soluções Profissionais', en: 'Professional Solutions' },
  'services.hero.title': { pt: 'Serviços Premium', en: 'Premium Services' },
  'services.hero.subtitle': { pt: 'Gestão técnica, consultoria e manutenção com alto padrão de qualidade.', en: 'Technical management, consulting and maintenance with high quality standards.' },
  'services.loading': { pt: 'A carregar serviços...', en: 'Loading services...' },
  'services.details': { pt: 'Detalhes do Serviço', en: 'Service Details' },
  'services.portfolio.tag': { pt: 'Portfólio de Obras', en: 'Works Portfolio' },
  'services.portfolio.title': { pt: 'Projetos Concluídos', en: 'Completed Projects' },
  'services.portfolio.desc': { pt: 'Resultados reais da nossa equipa técnica em Moçambique.', en: 'Real results from our technical team in Mozambique.' },
  'services.portfolio.delivery': { pt: 'Entrega', en: 'Delivery' },
  'services.partners.title': { pt: 'Parceiros Estratégicos', en: 'Strategic Partners' },
  'services.partners.subtitle': { pt: 'Trabalhamos com os melhores para entregar o melhor.', en: 'We work with the best to deliver the best.' },
  'services.cta.title': { pt: 'Pronto para elevar o nível do seu imóvel?', en: 'Ready to elevate your property level?' },
  'services.cta.desc': { pt: 'Fale com um dos nossos especialistas técnicos e descubra como podemos valorizar o seu património.', en: 'Talk to one of our technical specialists and discover how we can value your heritage.' },
  'services.cta.call': { pt: 'Ligar Agora', en: 'Call Now' },
  'services.cta.whatsapp': { pt: 'WhatsApp', en: 'WhatsApp' },
  'services.modal.tag': { pt: 'Ficha de Serviço', en: 'Service Sheet' },
  'services.modal.desc_title': { pt: 'Descrição Detalhada', en: 'Detailed Description' },
  'services.modal.quote': { pt: 'Solicitar Orçamento', en: 'Request Quote' },
  'services.modal.close': { pt: 'Fechar', en: 'Close' },

  // Footer
  'footer.tagline': { pt: 'Curadoria imobiliária e manutenção em Moçambique.', en: 'Real estate curation and maintenance in Mozambique.' },
  'footer.links.title': { pt: 'Links', en: 'Links' },
  'footer.units.title': { pt: 'Unidades', en: 'Units' },
  'footer.contact.title': { pt: 'Contacto', en: 'Contact' },
  'footer.legal.privacy': { pt: 'Privacidade', en: 'Privacy' },
  'footer.legal.terms': { pt: 'Termos', en: 'Terms' },
  'footer.links.staff': { pt: 'Gestão [Staff]', en: 'Management [Staff]' },

  // Admin / General ERP
  'erp.welcome': { pt: 'Bem-vindo ao Centro de Operações', en: 'Welcome to Operations Center' },
  'erp.role.admin': { pt: 'Administrador Senior', en: 'Senior Administrator' },
  'erp.role.staff': { pt: 'Colaborador Staff', en: 'Staff Member' },
  'erp.logout': { pt: 'Encerrar Sessão', en: 'Logout' },
  'erp.search': { pt: 'Procurar no sistema...', en: 'Search system...' },
  'erp.active_users': { pt: 'Utilizadores Ativos', en: 'Active Users' },
  'erp.session_time': { pt: 'Tempo de Sessão', en: 'Session Time' },

  // Sidebar / ERP Navigation
  'side.overview': { pt: 'Visão Geral', en: 'Overview' },
  'side.real_estate': { pt: 'Imobiliária', en: 'Real Estate' },
  'side.properties': { pt: 'Imóveis', en: 'Properties' },
  'side.leads': { pt: 'Leads & Contactos', en: 'Leads & Contacts' },
  'side.ops': { pt: 'Operações', en: 'Operations' },
  'side.finance': { pt: 'Financeiro', en: 'Finance' },
  'side.hr': { pt: 'Recursos Humanos', en: 'Human Resources' },
  'side.projects': { pt: 'Projetos de Obra', en: 'Construction Projects' },
  'side.fleet': { pt: 'Gestão de Frota', en: 'Fleet Management' },
  'side.admin': { pt: 'Administração', en: 'Administration' },
  'side.reports': { pt: 'Relatórios', en: 'Reports' },

  // Finance Module
  'fin.title': { pt: 'Controle Financeiro', en: 'Financial Control' },
  'fin.subtitle': { pt: 'Fluxo de caixa e transações do ecossistema.', en: 'Cash flow and ecosystem transactions.' },
  'fin.balance': { pt: 'Saldo Disponível', en: 'Available Balance' },
  'fin.revenue': { pt: 'Receita Mensal', en: 'Monthly Revenue' },
  'fin.expenses': { pt: 'Despesas Gerais', en: 'General Expenses' },
  'fin.new_transaction': { pt: 'Nova Transação', en: 'New Transaction' },
  'fin.history': { pt: 'Histórico de Transações', en: 'Transaction History' },
  'fin.status.paid': { pt: 'Pago', en: 'Paid' },
  'fin.status.pending': { pt: 'Pendente', en: 'Pending' },

  // HR Module
  'hr.title': { pt: 'Gestão de Capital Humano', en: 'Human Capital Management' },
  'hr.subtitle': { pt: 'Colaboradores, folha de pagamento e formação.', en: 'Employees, payroll and training.' },
  'hr.total_staff': { pt: 'Total Colaboradores', en: 'Total Employees' },
  'hr.active_contracts': { pt: 'Contratos Ativos', en: 'Active Contracts' },
  'hr.add_staff': { pt: 'Admitir Colaborador', en: 'Add Employee' },
  'hr.list': { pt: 'Lista de Staff', en: 'Staff List' },

  // Fleet Module
  'fleet.title': { pt: 'Logística & Frota', en: 'Logistics & Fleet' },
  'fleet.subtitle': { pt: 'Controle de veículos e combustíveis.', en: 'Vehicle and fuel control.' },
  'fleet.total_vehicles': { pt: 'Veículos na Frota', en: 'Vehicles in Fleet' },
  'fleet.maintenance': { pt: 'Em Manutenção', en: 'In Maintenance' },
  'fleet.add_vehicle': { pt: 'Registar Veículo', en: 'Register Vehicle' },

  // User Roles
  'role.system_admin': { pt: 'Administrador de Sistema', en: 'System Administrator' },
  'role.ceo': { pt: 'Director Executivo (CEO)', en: 'Executive Director (CEO)' },
  'role.manager': { pt: 'Gestor Geral Operacional', en: 'General Operations Manager' },
  'role.finance': { pt: 'Director Financeiro', en: 'Finance Director' },
  'role.hr': { pt: 'Gestor de Recursos Humanos', en: 'Human Resources Manager' },
  'role.sales_lead': { pt: 'Chefe de Vendas', en: 'Sales Lead' },
  'role.sales': { pt: 'Consultor Imobiliário', en: 'Real Estate Consultant' },
  'role.maint_lead': { pt: 'Supervisor de Manutenção', en: 'Maintenance Supervisor' },
  'role.maint_tech': { pt: 'Técnico Especializado', en: 'Specialized Technician' },
  'role.it': { pt: 'Gestor de TI & Sistemas', en: 'IT & Systems Manager' },
  'role.marketing': { pt: 'Marketing & Comunicação', en: 'Marketing & Communication' },
  'role.security': { pt: 'Chefe de Segurança', en: 'Security Lead' },
  'role.reception': { pt: 'Recepcionista / Front Desk', en: 'Receptionist / Front Desk' },
  'role.employee': { pt: 'Colaborador Geral', en: 'General Employee' },

  // Sidebar Sub-labels
  'side.finance.sub': { pt: 'Controle de Caixa', en: 'Cash Control' },
  'side.hr.sub': { pt: 'Recursos', en: 'Resources' },
  'side.props.sub': { pt: 'Imóveis', en: 'Properties' },
  'side.projects.sub': { pt: 'Build Ops', en: 'Build Ops' },
  'side.fleet.sub': { pt: 'Logística', en: 'Logistics' },
  'side.admin.sub': { pt: 'Segurança', en: 'Security' },

  // Dashboard Specific
  'dash.core_sync': { pt: 'Neural Core Sincronizando', en: 'Neural Core Syncing' },
  'dash.sync_button': { pt: 'Sincronizar', en: 'Sync Now' },
  'dash.online': { pt: 'Online', en: 'Online' },
  'dash.audit': { pt: 'Auditoria', en: 'Audit' },
  'dash.new': { pt: 'Novos', en: 'New' },
  'dash.peak': { pt: 'Pico', en: 'Peak' },
  'dash.projection': { pt: 'Projeção', en: 'Projection' },
  'dash.thinking_neural': { pt: 'Consultando Rede Neural Financeira...', en: 'Consulting Financial Neural Network...' },
  'dash.recalculate': { pt: 'Recalcular Cenários', en: 'Recalculate Scenarios' },
  'dash.agenda': { pt: 'Agenda Operacional', en: 'Operational Agenda' },

  // Finance Module
  'fin.today': { pt: 'Hoje', en: 'Today' },
  'fin.week': { pt: 'Esta Semana', en: 'This Week' },
  'fin.month': { pt: 'Este Mês', en: 'This Month' },
  'fin.year': { pt: 'Este Ano', en: 'This Year' },
  'fin.custom': { pt: 'Personalizado', en: 'Custom' },
  'fin.all_units': { pt: 'Todas Unidades', en: 'All Units' },
  'fin.all': { pt: 'Todas', en: 'All' },
  'fin.sales': { pt: 'Vendas', en: 'Sales' },
  'fin.operational': { pt: 'Operacional', en: 'Operational' },
  'fin.salaries': { pt: 'Salários', en: 'Salaries' },
  'fin.marketing': { pt: 'Marketing', en: 'Marketing' },
  'fin.all_statuses': { pt: 'Todos', en: 'All' },
  'fin.paid': { pt: 'Pago', en: 'Paid' },
  'fin.pending': { pt: 'Pendente', en: 'Pending' },
  'fin.overdue': { pt: 'Vencido', en: 'Overdue' },
  'fin.margin': { pt: 'Margem %', en: 'Margin %' },
  'fin.cash_balance': { pt: 'Saldo Caixa', en: 'Cash Balance' },
  'fin.daily_flow': { pt: 'Fluxo de Caixa Diário', en: 'Daily Cash Flow' },
  'fin.movement': { pt: 'Movimentação Real (Entradas/Saídas)', en: 'Real Movement (In/Out)' },
  'fin.accounts_receivable': { pt: 'Contas a Receber', en: 'Accounts Receivable' },
  'fin.accounts_payable': { pt: 'Contas a Pagar', en: 'Accounts Payable' },
  'fin.reports_export': { pt: 'Relatórios & Export', en: 'Reports & Export' },
  'fin.cash_flow': { pt: 'Fluxo de Caixa', en: 'Cash Flow' },
  'fin.default_desc': { pt: 'DRE e movimentação diária.', en: 'P&L and daily movement.' },
  'fin.delinquency': { pt: 'Inadimplência', en: 'Delinquency' },
  'fin.delinquency_desc': { pt: 'Faturas vencidas e não pagas.', en: 'Overdue and unpaid invoices.' },
  'fin.costs_project': { pt: 'Custos por Projeto', en: 'Costs per Project' },
  'fin.costs_desc': { pt: 'Rentabilidade por unidade de obra.', en: 'Profitability per work unit.' },
  'fin.export_csv': { pt: 'Exportar CSV', en: 'Export CSV' },
  'fin.date_due': { pt: 'Data / Vencimento', en: 'Date / Due' },
  'fin.desc_client': { pt: 'Descrição / Cliente', en: 'Description / Client' },
  'fin.cat_unit': { pt: 'Categoria / Unidade', en: 'Category / Unit' },
  'fin.actions': { pt: 'Acções', en: 'Actions' },
  'fin.internal_flow': { pt: 'Fluxo Interno', en: 'Internal Flow' },
  'fin.general': { pt: 'Geral', en: 'General' },

  // HR Module
  'hr.hub': { pt: 'Monte Staff Hub', en: 'Monte Staff Hub' },
  'hr.staff': { pt: 'Corpo Ativo', en: 'Active Staff' },
  'hr.vacancies': { pt: 'Vagas', en: 'Vacancies' },
  'hr.applications': { pt: 'Candidaturas', en: 'Applications' },
  'hr.publish_vacancy': { pt: 'Publicar Vaga', en: 'Publish Vacancy' },
  'hr.search_vacancies': { pt: 'Pesquisar vagas...', en: 'Search vacancies...' },
  'hr.type': { pt: 'Tipo', en: 'Type' },
  'hr.edit': { pt: 'Editar', en: 'Edit' },
  'hr.vac_updated': { pt: 'Vaga actualizada com sucesso!', en: 'Vacancy updated successfully!' },
  'hr.vac_published': { pt: 'Vaga publicada com sucesso!', en: 'Vacancy published successfully!' },
  'hr.total_effective': { pt: 'Efetivos Totais', en: 'Total Employees' },
  'hr.active_status': { pt: 'Status Ativo', en: 'Active Status' },
  'hr.hr_pipeline': { pt: 'Pipeline RH', en: 'HR Pipeline' },
  'hr.open_vacancies': { pt: 'Vagas Abertas', en: 'Open Vacancies' },
  'hr.search_staff': { pt: 'Pesquisar por nome ou email...', en: 'Search by name or email...' },
  'hr.hire_employee': { pt: 'Admitir Colaborador', en: 'Hire Employee' },
  'hr.total_apps': { pt: 'Total Candidaturas', en: 'Total Applications' },
  'hr.pending': { pt: 'Em Pendente', en: 'Pending' },
  'hr.approved': { pt: 'Aprovadas', en: 'Approved' },
  'hr.locate_candidate': { pt: 'Localizar candidato ou vaga...', en: 'Locate candidate or vacancy...' },
  'hr.all_statuses': { pt: 'Todos Status', en: 'All Statuses' },
  'hr.candidate': { pt: 'Candidato', en: 'Candidate' },
  'hr.vac_date': { pt: 'Vaga / Data', en: 'Vacancy / Date' },
  'hr.dossier_docs': { pt: 'Dossiê / Documentos', en: 'Dossier / Documents' },
  'hr.no_attachments': { pt: 'Sem Anexos', en: 'No Attachments' },
  'hr.revert': { pt: 'Reverter', en: 'Revert' },
  'hr.edit_vac': { pt: 'Editar Oportunidade', en: 'Edit Opportunity' },
  'hr.new_vac': { pt: 'Publicar Nova Vaga', en: 'Publish New Vacancy' },
  'hr.vac_title': { pt: 'Título da Vaga / Cargo', en: 'Vacancy Title / Role' },
  'hr.vac_area': { pt: 'Área / Sector', en: 'Area / Sector' },
  'hr.contract_type': { pt: 'Tipo de Contrato', en: 'Contract Type' },
  'hr.location': { pt: 'Localização', en: 'Location' },
  'hr.salary_remun': { pt: 'Salário / Remuneração', en: 'Salary / Remuneration' },
  'hr.vac_status': { pt: 'Status da Vaga', en: 'Vacancy Status' },
  'hr.desc_reqs': { pt: 'Descrição e Requisitos', en: 'Description and Requirements' },
  'hr.copy_content': { pt: 'Copiar Conteúdo', en: 'Copy Content' },
  'hr.generate_ai': { pt: 'Gerar com IA', en: 'Generate with AI' },
  'hr.update_profile': { pt: 'Actualizar Cadastro', en: 'Update Profile' },
  'hr.new_hire': { pt: 'Nova Admissão de Staff', en: 'New Staff Admission' },
  'hr.full_name': { pt: 'Nome Completo', en: 'Full Name' },
  'hr.gender': { pt: 'Gênero', en: 'Gender' },
  'hr.role_func': { pt: 'Cargo / Função', en: 'Role / Function' },
  'hr.department': { pt: 'Departamento', en: 'Department' },
  'hr.base_salary': { pt: 'Salário Base (MT)', en: 'Base Salary (MT)' },
  'hr.corp_email': { pt: 'Email Corporativo', en: 'Corporate Email' },
  'hr.phone_contact': { pt: 'Contacto Telefónico', en: 'Phone Contact' },
  'hr.contract_status': { pt: 'Status Contratual', en: 'Contractual Status' },
  'hr.male': { pt: 'Masculino', en: 'Male' },
  'hr.female': { pt: 'Feminino', en: 'Female' },
  'hr.active': { pt: 'Ativo', en: 'Active' },
  'hr.vacation': { pt: 'Férias', en: 'Vacation' },
  'hr.inactive': { pt: 'Inativo', en: 'Inactive' },
  'hr.suspended': { pt: 'Suspenso', en: 'Suspended' },
  'hr.vac_title_required': { pt: 'O título da vaga é obrigatório.', en: 'The vacancy title is required.' },
  'hr.vac_area_gen': { pt: 'Por favor, indique o título da vaga primeiro.', en: 'Please specify the vacancy title first.' },
  'hr.confirm_delete_vac': { pt: 'Tem a certeza que deseja remover esta vaga?', en: 'Are you sure you want to remove this vacancy?' },
  'hr.confirm_delete_emp': { pt: 'Tem a certeza que deseja remover este colaborador?', en: 'Are you sure you want to remove this employee?' },
  'hr.mgmt': { pt: 'Gestão de Capital Humano', en: 'Human Capital Management' },
  'fleet.incorporate': { pt: 'Incorporar Veículo', en: 'Add Vehicle' },
  'fleet.total_units': { pt: 'Unidades Totais', en: 'Total Units' },
  'fleet.active_flow': { pt: 'Fluxo Activo', en: 'Active Flow' },
  'fleet.availability': { pt: 'Disponibilidade', en: 'Availability' },
  'fleet.alert_point': { pt: 'Ponto de Alerta', en: 'Alert Point' },
  'fleet.search_placeholder': { pt: 'Localizar por matrícula ou motorista...', en: 'Search by plate or driver...' },
  'fleet.all_status': { pt: 'Todos Status', en: 'All Statuses' },
  'fleet.available': { pt: 'Disponível', en: 'Available' },
  'fleet.in_service': { pt: 'Em Serviço', en: 'In Service' },
  'fleet.wash': { pt: 'Lavagem', en: 'Wash' },
  'fleet.driver': { pt: 'Condutor', en: 'Driver' },
  'fleet.odometer': { pt: 'Odométro', en: 'Odometer' },
  'fleet.fuel_level': { pt: 'Nível de Combustível', en: 'Fuel Level' },
  'fleet.last_maint': { pt: 'Manutenção Recente', en: 'Last Maintenance' },
  'fleet.safe': { pt: 'Seguro', en: 'Safe' },
  'fleet.attention': { pt: 'Atenção', en: 'Attention' },
  'fleet.critical': { pt: 'Crítico', en: 'Critical' },
  'fleet.no_units': { pt: 'Nenhuma unidade detectada nos parâmetros atuais.', en: 'No units detected with current parameters.' },
  'fleet.scan_complete': { pt: 'Escaneamento Concluído', en: 'Scan Complete' },
  'fleet.edit_vehicle': { pt: 'Editar Veículo', en: 'Edit Vehicle' },
  'fleet.register_vehicle': { pt: 'Registar Novo Veículo', en: 'Register New Vehicle' },
  'fleet.tech_reg': { pt: 'Cadastro Técnico de Frota Monte', en: 'Monte Fleet Technical Registry' },
  'fleet.model_desc': { pt: 'Modelo / Descrição', en: 'Model / Description' },
  'fleet.plate': { pt: 'Matrícula', en: 'Plate / Registration' },
  'fleet.assigned_driver': { pt: 'Condutor Designado', en: 'Assigned Driver' },
  'fleet.unit_state': { pt: 'Estado da Unidade', en: 'Unit State' },
  'fleet.update_unit': { pt: 'Actualizar Unidade', en: 'Update Unit' },
  'fleet.integrate_fleet': { pt: 'Integrar na Frota', en: 'Integrate into Fleet' },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tRole: (role: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('app_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  const tRole = (role: string): string => {
    const roleMap: Record<string, string> = {
      'Administrador de Sistema': 'role.system_admin',
      'Director Executivo (CEO)': 'role.ceo',
      'Gestor Geral Operacional': 'role.manager',
      'Director Financeiro': 'role.finance',
      'Gestor de Recursos Humanos': 'role.hr',
      'Chefe de Vendas': 'role.sales_lead',
      'Consultor Imobiliário': 'role.sales',
      'Supervisor de Manutenção': 'role.maint_lead',
      'Técnico Especializado': 'role.maint_tech',
      'Gestor de TI & Sistemas': 'role.it',
      'Marketing & Comunicação': 'role.marketing',
      'Chefe de Segurança': 'role.security',
      'Recepcionista / Front Desk': 'role.reception',
      'Colaborador Geral': 'role.employee',
    };
    const key = roleMap[role] || 'role.employee';
    return t(key);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, tRole }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within an I18nProvider');
  return context;
};
