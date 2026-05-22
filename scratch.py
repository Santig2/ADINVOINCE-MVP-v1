import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace imports
    content = content.replace(
        'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"',
        'import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"'
    )

    sections = [
        ("user", "blue", "User", "User Profile", "Personal details & preferences"),
        ("company", "indigo", "Building2", "Company", "Business info & templates"),
        ("invoices", "emerald", "FileText", "Invoices", "Numbering & auto-reminders"),
        ("payments", "amber", "CreditCard", "Payments", "Payment gateways & methods"),
        ("general", "slate", "SettingsIcon", "General", "App settings & data export"),
        ("data", "rose", "Database", "Backup", "Export your data"),
    ]
    
    # Extract contents for each tab
    contents = {}
    for value, color, icon, title, desc in sections:
        pattern = rf'<TabsContent value="{value}"[^>]*>(.*?)</TabsContent>'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            inner_content = match.group(1).strip()
            contents[value] = inner_content

    # Now build the new Accordion block
    new_accordion = ['<Accordion type="single" collapsible defaultValue="user" className="flex flex-col gap-4 max-w-4xl mx-auto mt-4 pb-20">']
    
    for value, color, icon, title, desc in sections:
        inner_content = contents.get(value, "<div>Content not found</div>")
        
        item = f"""
          {{/* {title} Configuration */}}
          <AccordionItem value="{value}" className="border border-white/10 dark:border-white/5 rounded-2xl bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-xl shadow-sm overflow-hidden data-[state=open]:border-{color}-500/30 data-[state=open]:shadow-md data-[state=open]:shadow-{color}-500/10 transition-all duration-300">
            <AccordionTrigger id="config-{value}" className="px-6 py-4 hover:bg-card/50 hover:no-underline group transition-all [&[data-state=open]>svg]:rotate-180">
              <div className="flex items-center gap-4 text-left flex-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-{color}-500/10 to-{color}-500/5 border border-{color}-500/20 text-{color}-500 flex items-center justify-center shrink-0 group-data-[state=open]:scale-110 group-data-[state=open]:bg-{color}-500/20 transition-all duration-300 shadow-inner">
                  <{icon} className="h-5 w-5 drop-shadow-sm" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-foreground text-base group-hover:text-{color}-500 transition-colors">{title}</span>
                  <span className="text-xs text-muted-foreground font-normal mt-0.5">{desc}</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2">
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                {inner_content}
              </div>
            </AccordionContent>
          </AccordionItem>"""
        new_accordion.append(item)

    new_accordion.append("        </Accordion>")
    new_accordion_str = "\n".join(new_accordion)

    # Now replace the entire Tabs block
    # Finding the start and end of Tabs
    tabs_start = content.find('<Tabs defaultValue="user"')
    
    # We must find the correct closing tag for the Tabs. We can do this by balancing the tags if needed, 
    # but since we know it ends right before the dialogs:
    dialog_start = content.find('<Dialog open={showSuccessDialog}')
    
    if tabs_start != -1 and dialog_start != -1:
        # The </Tabs> should be just before the dialogs, but there's a </div> closing the container
        # Let's find the </Tabs> that is before dialog_start
        tabs_end = content.rfind('</Tabs>', tabs_start, dialog_start) + len('</Tabs>')
        if tabs_end > len('</Tabs>'):
            content = content[:tabs_start] + new_accordion_str + content[tabs_end:]
        else:
            print("Could not find </Tabs> before Dialog")
    else:
        print("Could not find <Tabs> block or Dialog start")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

process_file("c:/Users/santi/Desktop/codigo/ADINVOINCE MVP v1/app/configuration/page.tsx")
