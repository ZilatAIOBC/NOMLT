import React from 'react';
import { NavLink } from 'react-router-dom';

type IconComponent = React.ComponentType<any>;

export type SidebarItem = {
  name: string;
  href: string;
  icon: string | IconComponent;
  color: string;
};

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

type Props = {
  sections: SidebarSection[];
  isCollapsible: boolean;
  isExpanded: boolean;
  handleNavClick: () => void;
  isMobile: boolean;
  isTablet: boolean;
};

const SidebarSectionList: React.FC<Props> = ({
  sections,
  isCollapsible,
  isExpanded,
  handleNavClick,
  isMobile,
  isTablet,
}) => {
  const ItemIcon: React.FC<{ item: SidebarItem; active: boolean }> = ({ item, active }) => {
    const isCustomIcon = typeof item.icon === 'string';
    const useLargeSize = (isCollapsible && !isExpanded) || isMobile || isTablet;
    const sizeClass = useLargeSize ? 'w-6 h-6' : 'w-5 h-5';
    if (isCustomIcon) {
      return (
        <img
          src={`/${item.icon}.svg`}
          alt={String(item.icon)}
          className={`${active ? 'brightness-0 invert' : ''} ${sizeClass} transition-opacity hover:opacity-80`}
        />
      );
    }
    const IconComp = item.icon as IconComponent;
    return <IconComp className={`${sizeClass} ${active ? 'text-white' : item.color} transition-opacity hover:opacity-80`} />;
  };
  return (
    <>
      {sections.map((section) => (
        <div key={section.title} className="space-y-2 lg:space-y-1 xl:space-y-2">
          {(!isCollapsible || isExpanded) && (
            <div className="px-3 text-gray-400/80 text-xs font-semibold tracking-wide">
              {section.title}
            </div>
          )}
          {section.items.map((item: SidebarItem) => {
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => `flex ${isMobile && isExpanded ? 'w-[199px]' : ''} items-center gap-3 ${isCollapsible && !isExpanded ? 'px-3 py-3' : 'px-3 py-3'} rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-[#4057EB] via-[#823AEA] to-[#2C60EB] text-white'
                    : (isCollapsible && !isExpanded)
                      ? 'text-white hover:bg-gradient-to-r hover:from-[#4057EB] hover:via-[#823AEA] hover:to-[#2C60EB] hover:text-white'
                      : 'text-white hover:bg-white/10'
                } ${isCollapsible && !isExpanded ? 'justify-start' : ''}`}
                onClick={handleNavClick}
                title={isCollapsible && !isExpanded ? item.name : undefined}
              >
                {({ isActive }) => (
                  <>
                    <ItemIcon item={item} active={isActive} />
                    {(!isCollapsible || isExpanded) && <span className="whitespace-nowrap">{item.name}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      ))}
    </>
  );
};

export default SidebarSectionList;


